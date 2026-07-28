"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Loader2,
  Save,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  adminGetPaymentSettings,
  adminUpdatePaymentSettings,
  type PaymentProvider,
  type PaymentSettingsAdmin,
  type PaymentSettingsUpdatePayload,
} from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";

const providerOptions = [
  {
    id: "manual" as const,
    title: "Manual",
    desc: "COD / bayar manual seperti sekarang (tanpa gateway).",
    icon: Wallet,
  },
  {
    id: "midtrans" as const,
    title: "Midtrans Snap",
    desc: "Pembayaran otomatis via Snap popup + webhook Midtrans.",
    icon: CreditCard,
  },
  {
    id: "xendit" as const,
    title: "Xendit QRIS",
    desc: "Pembayaran QRIS otomatis via Xendit + webhook callback.",
    icon: ShieldCheck,
  },
];

export default function PaymentSettingsPage() {
  const { t, common } = useAdminI18n();
  const [settings, setSettings] = useState<PaymentSettingsAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [provider, setProvider] = useState<PaymentProvider>("manual");
  const [isProduction, setIsProduction] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [serverKey, setServerKey] = useState("");

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetPaymentSettings();
      setSettings(data);
      setProvider(data.provider || "manual");
      setIsProduction(Boolean(data.is_production));
      setMerchantId(data.merchant_id ?? "");
      setClientKey(data.client_key ?? "");
      setServerKey("");
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal memuat pengaturan",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: PaymentSettingsUpdatePayload = {
        provider,
        is_production: isProduction,
        merchant_id: merchantId.trim() || null,
        client_key: clientKey.trim() || null,
      };
      if (serverKey.trim()) {
        payload.server_key = serverKey.trim();
      }
      const data = await adminUpdatePaymentSettings(payload);
      setSettings(data);
      setServerKey("");
      showNotice(
        "success",
        t(
          "payment",
          "saved",
          "Pengaturan pembayaran berhasil disimpan.",
          "Payment settings saved successfully.",
        ),
      );
    } catch (e) {
      showNotice(
        "error",
        e instanceof Error ? e.message : "Gagal menyimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const showGatewayForm = provider === "midtrans" || provider === "xendit";
  const isXendit = provider === "xendit";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {t(
            "payment",
            "title",
            "Pengaturan Pembayaran",
            "Payment Settings",
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t(
            "payment",
            "subtitle",
            "Pilih Manual, Midtrans, atau Xendit seperti di Arcanisia.",
            "Choose Manual, Midtrans, or Xendit like Arcanisia.",
          )}
        </p>
      </div>

      {notice ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {loading || !settings ? (
        <div className="h-52 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              {t("payment", "mode", "Mode pembayaran", "Payment mode")}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {providerOptions.map((option) => {
                const active = provider === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setProvider(option.id)}
                    className={`admin-select-card text-left rounded-2xl border p-4 transition ${
                      active
                        ? "admin-select-card-active border-gray-900 bg-gray-900 text-white shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${
                        active ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <p className="text-sm font-bold">{option.title}</p>
                    <p
                      className={`admin-select-card-muted mt-1.5 text-xs leading-relaxed ${
                        active ? "text-white/70" : "text-gray-500"
                      }`}
                    >
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {showGatewayForm ? (
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                    settings.configured && settings.provider === provider
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {settings.configured && settings.provider === provider
                    ? "Configured"
                    : "Belum lengkap"}
                </span>
                <span className="text-xs text-gray-400">
                  {isXendit
                    ? "Callback: {APP_URL}/api/payments/xendit/notification"
                    : "Notifikasi: {APP_URL}/api/payments/midtrans/notification"}
                </span>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isProduction}
                  onChange={(e) => setIsProduction(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Mode production{" "}
                {isXendit
                  ? "(kunci live Xendit)"
                  : "(matikan untuk Sandbox Midtrans)"}
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                {isXendit
                  ? "Business / Merchant ID (opsional)"
                  : "Merchant ID"}
                <input
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={isXendit ? "opsional" : "Gxxxxxxxxxx"}
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                {isXendit ? "Callback verification token" : "Client Key"}
                <input
                  value={clientKey}
                  onChange={(e) => setClientKey(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={
                    isXendit ? "xnd_development_..." : "SB-Mid-client-..."
                  }
                  autoComplete="off"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                {isXendit ? "Secret Key" : "Server Key"}
                <input
                  type="password"
                  value={serverKey}
                  onChange={(e) => setServerKey(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={
                    settings.has_server_key
                      ? `Tersimpan ${settings.server_key_masked ?? "****"} — kosongkan untuk mempertahankan`
                      : isXendit
                        ? "xnd_development_..."
                        : "SB-Mid-server-..."
                  }
                  autoComplete="new-password"
                />
              </label>
            </div>
          ) : (
            <p className="border-t border-gray-100 pt-5 text-sm text-gray-500">
              Mode manual memakai COD / pembayaran manual di checkout. Tidak
              membutuhkan API key gateway.
            </p>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {common.save_changes}
          </button>
        </div>
      )}
    </div>
  );
}
