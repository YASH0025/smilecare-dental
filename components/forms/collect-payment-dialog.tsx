"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Banknote, CheckCircle2, Loader2, Mail, MailX, QrCode, Settings2, Smartphone } from "lucide-react";
import type { InvoiceView } from "@/types/views";
import { useRecordPayment, useSettings } from "@/lib/query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency, toDateKey } from "@/lib/utils";

type Mode = "UPI" | "CASH";

/**
 * Standard UPI deep link (NPCI spec). Any UPI app — GPay, PhonePe, Paytm, BHIM —
 * opens it with the payee, amount and note pre-filled.
 */
export function buildUpiUri({ upiId, payeeName, amount, note }: { upiId: string; payeeName: string; amount: number; note: string }) {
  const enc = (v: string) => encodeURIComponent(v).replace(/%40/g, "@"); // some UPI apps reject an encoded "@" in the VPA
  const params: [string, string][] = [
    ["pa", upiId],
    ["pn", payeeName],
    ["am", amount.toFixed(2)],
    ["cu", "INR"],
    ["tn", note],
  ];
  return `upi://pay?${params.map(([k, v]) => `${k}=${enc(v)}`).join("&")}`;
}

/**
 * Collect the outstanding balance of an invoice by UPI (QR code) or cash.
 * Saving records a payment for the full balance; the server then emails the receipt.
 */
export function CollectPaymentDialog({
  open,
  onOpenChange,
  invoice,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: InvoiceView | null;
}) {
  const [mode, setMode] = React.useState<Mode>("UPI");
  const [reference, setReference] = React.useState("");
  const [qr, setQr] = React.useState<string | null>(null);
  const settings = useSettings();
  const recordPayment = useRecordPayment();

  const amount = invoice?.balance ?? 0;
  const upiId = settings.data?.upiId?.trim() ?? "";
  const payeeName = settings.data?.upiPayeeName || settings.data?.name || "Clinic";
  const upiUri = invoice && upiId ? buildUpiUri({ upiId, payeeName, amount, note: `Invoice ${invoice.number}` }) : null;

  React.useEffect(() => {
    if (open) {
      setMode("UPI");
      setReference("");
    }
  }, [open, invoice?.id]);

  React.useEffect(() => {
    let cancelled = false;
    setQr(null);
    if (!open || mode !== "UPI" || !upiUri) return;
    QRCode.toDataURL(upiUri, { width: 480, margin: 1, errorCorrectionLevel: "M", color: { dark: "#0f172a", light: "#ffffff" } })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [open, mode, upiUri]);

  async function confirm() {
    if (!invoice) return;
    try {
      await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        data: {
          amount,
          method: mode,
          type: "PAYMENT",
          date: toDateKey(new Date()),
          reference: mode === "UPI" ? reference.trim() : "",
          notes: mode === "UPI" ? "Collected via UPI QR" : "Collected in cash",
        },
      });
      onOpenChange(false);
    } catch {
      /* error toast shown by the mutation; keep the dialog open */
    }
  }

  const saving = recordPayment.isPending;
  const upiBlocked = mode === "UPI" && (!upiId || settings.isPending);
  const email = invoice?.patientEmail?.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect payment</DialogTitle>
          <DialogDescription>{invoice && `${invoice.number} · ${invoice.patientName}`}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-canvas px-4 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount due</p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums" data-testid="collect-amount">
            {formatCurrency(amount, true)}
          </p>
        </div>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)} className="grid grid-cols-2 gap-2" aria-label="Payment method">
          {(
            [
              { value: "UPI", label: "UPI", hint: "Show QR code", icon: QrCode },
              { value: "CASH", label: "Cash", hint: "Collect at desk", icon: Banknote },
            ] as const
          ).map(({ value, label, hint, icon: Icon }) => (
            <Label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50"
            >
              <RadioGroupItem value={value} className="sr-only" />
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs font-normal text-muted-foreground">{hint}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        {mode === "UPI" ? (
          settings.isPending ? (
            <Skeleton className="mx-auto size-56" />
          ) : !upiId ? (
            <Alert>
              <Settings2 />
              <AlertTitle>UPI ID not set</AlertTitle>
              <AlertDescription>
                <p>
                  Add the clinic&apos;s UPI ID in{" "}
                  <Link href="/admin/settings" className="font-medium text-primary underline-offset-2 hover:underline">
                    Settings → Payments
                  </Link>{" "}
                  to generate QR codes.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto flex size-56 items-center justify-center rounded-xl border bg-white p-2">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt={`UPI QR code to pay ${formatCurrency(amount, true)} to ${payeeName}`} className="size-full" data-testid="upi-qr" />
                ) : (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <Smartphone className="size-3.5" aria-hidden /> Scan with GPay, PhonePe, Paytm or any UPI app
              </p>
              <p className="text-center text-sm">
                Pay to <span className="font-medium">{payeeName}</span> · <span className="font-mono text-xs">{upiId}</span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="upi-ref">UPI reference / UTR (optional)</Label>
                <Input
                  id="upi-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="12-digit UTR from the patient's UPI app"
                  maxLength={60}
                  inputMode="numeric"
                />
              </div>
              <p className="text-xs text-muted-foreground">Check that the money has arrived in the clinic&apos;s UPI app before confirming.</p>
            </div>
          )
        ) : (
          <p className="rounded-lg border border-dashed px-4 py-3 text-center text-sm text-muted-foreground">
            Collect <span className="font-semibold text-foreground">{formatCurrency(amount, true)}</span> in cash from the patient.
          </p>
        )}

        <p className={cn("flex items-center gap-1.5 text-xs", email ? "text-muted-foreground" : "text-amber-700")}>
          {email ? <Mail className="size-3.5" aria-hidden /> : <MailX className="size-3.5" aria-hidden />}
          {email ? (
            <>
              Receipt will be emailed to <span className="font-medium text-foreground">{email}</span>
            </>
          ) : (
            "No email on file — a receipt won't be sent."
          )}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={saving || upiBlocked || amount <= 0}>
            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            {saving ? "Saving…" : mode === "UPI" ? "Payment received" : "Cash received"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
