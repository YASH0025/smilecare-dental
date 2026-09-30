import { billingService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

/** POST /api/invoices/:id/payments — record a payment or refund. */
export const POST = route<{ id: string }>(
  async (req, { params }) => ok(await billingService.addPayment(params.id, await readBody(req)), 201),
  { admin: true },
);
