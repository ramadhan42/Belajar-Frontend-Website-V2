export type PaymentStatus = "pending" | "success" | "cancelled";

export function normalizePaymentStatus(
  value?: string | null,
): PaymentStatus {
  const v = String(value || "").toLowerCase().trim();
  if (v === "success" || v === "paid" || v === "settlement") {
    return "success";
  }
  if (v === "cancelled" || v === "canceled" || v === "failed" || v === "expire" || v === "expired") {
    return "cancelled";
  }
  return "pending";
}

export function isSuccessfulPayment(value?: string | null): boolean {
  return normalizePaymentStatus(value) === "success";
}

export function paymentStatusLabel(
  status: PaymentStatus,
  locale: "id" | "en" = "id",
): string {
  if (locale === "en") {
    if (status === "success") return "Payment successful";
    if (status === "cancelled") return "Payment cancelled";
    return "Payment pending";
  }
  if (status === "success") return "Pembayaran berhasil";
  if (status === "cancelled") return "Pembayaran dibatalkan";
  return "Pembayaran pending";
}

export function paymentStatusBadgeClass(status: PaymentStatus): string {
  if (status === "success") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (status === "cancelled") {
    return "bg-red-50 text-red-700 border-red-100";
  }
  return "bg-amber-50 text-amber-700 border-amber-100";
}
