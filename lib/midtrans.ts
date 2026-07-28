"use client";

export type SnapPayResult = {
  status_code?: string;
  status_message?: string;
  transaction_id?: string;
  order_id?: string;
  gross_amount?: string;
  payment_type?: string;
  transaction_status?: string;
  fraud_status?: string;
};

type SnapPayCallbacks = {
  onSuccess?: (result: SnapPayResult) => void;
  onPending?: (result: SnapPayResult) => void;
  onError?: (result: SnapPayResult) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: SnapPayCallbacks) => void;
    };
  }
}

const SCRIPT_ID = "midtrans-snap-script";

export function midtransSnapScriptUrl(isProduction: boolean): string {
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export async function loadMidtransSnap(
  clientKey: string,
  isProduction: boolean,
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Midtrans Snap hanya tersedia di browser.");
  }

  if (window.snap) return;

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (window.snap) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Gagal memuat Midtrans Snap.")),
        { once: true },
      );
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = midtransSnapScriptUrl(isProduction);
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap."));
    document.body.appendChild(script);
  });
}

export async function openMidtransSnap(
  token: string,
  clientKey: string,
  isProduction: boolean,
  callbacks: SnapPayCallbacks = {},
): Promise<void> {
  await loadMidtransSnap(clientKey, isProduction);

  if (!window.snap) {
    throw new Error("Midtrans Snap belum siap.");
  }

  window.snap.pay(token, callbacks);
}
