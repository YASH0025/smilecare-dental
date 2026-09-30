import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to the SmileCare clinic dashboard.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SmileCare Dental Clinic</p>
      </div>
      <div className="relative hidden overflow-hidden bg-[#0f2a5c] lg:block">
        <div aria-hidden className="absolute -top-32 -right-32 size-[28rem] rounded-full bg-primary/50 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-teal/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-lg leading-relaxed text-white/90">
              “Everything for the day — schedule, patients, treatment plans and billing — in one calm place.”
            </p>
            <p className="mt-4 text-sm text-white/60">SmileCare clinic operations</p>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-white/60">
            <ShieldCheck className="size-4" aria-hidden />
            Demo environment · fictional data only
          </p>
        </div>
      </div>
    </main>
  );
}
