"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  EyeOff,
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
    hint: "COD",
    icon: Wallet,
  },
  {
    id: "midtrans" as const,
    title: "Midtrans",
    hint: "QRIS",
    icon: CreditCard,
  },
  {
    id: "xendit" as const,
    title: "Xendit",
    hint: "QRIS",
    icon: ShieldCheck,
  },
];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-gray-400">{hint}</p> : null}
    </label>
  );
}

const inputClass =
  "w-full h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 bg-white";

function SecretField({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggleVisible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10`}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          aria-label={visible ? "Sembunyikan" : "Tampilkan"}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );
}

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

  const [midtransProduction, setMidtransProduction] = useState(false);
  const [midtransMerchantId, setMidtransMerchantId] = useState("");
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);

  const [xenditProduction, setXenditProduction] = useState(false);
  const [xenditMerchantId, setXenditMerchantId] = useState("");
  const [xenditCallbackToken, setXenditCallbackToken] = useState("");
  const [xenditSecretKey, setXenditSecretKey] = useState("");
  const [showXenditSecretKey, setShowXenditSecretKey] = useState(false);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const applySettings = (data: PaymentSettingsAdmin) => {
    setSettings(data);
    setProvider(data.provider || "manual");

    setMidtransProduction(Boolean(data.midtrans?.is_production));
    setMidtransMerchantId(data.midtrans?.merchant_id ?? "");
    setMidtransClientKey(data.midtrans?.client_key ?? "");
    setMidtransServerKey(data.midtrans?.server_key ?? "");

    setXenditProduction(Boolean(data.xendit?.is_production));
    setXenditMerchantId(data.xendit?.merchant_id ?? "");
    setXenditCallbackToken(data.xendit?.callback_token ?? "");
    setXenditSecretKey(data.xendit?.secret_key ?? "");
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetPaymentSettings();
      applySettings(data);
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
        midtrans: {
          is_production: midtransProduction,
          merchant_id: midtransMerchantId.trim() || null,
          client_key: midtransClientKey.trim() || null,
          server_key: midtransServerKey.trim() || null,
        },
        xendit: {
          is_production: xenditProduction,
          merchant_id: xenditMerchantId.trim() || null,
          callback_token: xenditCallbackToken.trim() || null,
          secret_key: xenditSecretKey.trim() || null,
        },
      };
      const data = await adminUpdatePaymentSettings(payload);
      applySettings(data);
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

  const activeConfigured =
    provider === "midtrans"
      ? Boolean(settings?.midtrans?.configured)
      : provider === "xendit"
        ? Boolean(settings?.xendit?.configured)
        : true;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
            {t(
              "payment",
              "title",
              "Pengaturan Pembayaran",
              "Payment Settings",
            )}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Pilih gateway aktif. Kredensial Midtrans &amp; Xendit tersimpan
            terpisah.
          </p>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void handleSave()}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {common.save_changes}
        </button>
      </div>

      {notice ? (
        <div
          className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
            notice.type === "success"
              ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {loading || !settings ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Provider switcher */}
          <div className="border-b border-gray-100 bg-gray-50/70 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {providerOptions.map((option) => {
                const active = provider === option.id;
                const Icon = option.icon;
                const optionConfigured =
                  option.id === "manual"
                    ? true
                    : option.id === "midtrans"
                      ? Boolean(settings.midtrans?.configured)
                      : Boolean(settings.xendit?.configured);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setProvider(option.id)}
                    className={`admin-select-card relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "admin-select-card-active border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-white/10" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-tight">
                        {option.title}
                      </span>
                      <span
                        className={`admin-select-card-muted mt-0.5 block text-[11px] ${
                          active ? "text-white/65" : "text-gray-400"
                        }`}
                      >
                        {option.hint}
                        {option.id !== "manual"
                          ? ` · ${optionConfigured ? "tersimpan" : "belum diisi"}`
                          : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form body */}
          <div className="p-4 sm:p-5">
            {provider === "manual" ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-5 text-sm leading-relaxed text-gray-500">
                Checkout memakai <strong className="text-gray-700">Cash</strong>.
                Kredensial Midtrans dan Xendit tetap aman tersimpan terpisah.
              </div>
            ) : null}

            {provider === "midtrans" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        activeConfigured
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border border-amber-100 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {activeConfigured ? "Configured" : "Belum lengkap"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Webhook: /api/payments/midtrans/notification
                    </span>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={midtransProduction}
                      onChange={(e) => setMidtransProduction(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Production
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Merchant ID">
                    <input
                      value={midtransMerchantId}
                      onChange={(e) => setMidtransMerchantId(e.target.value)}
                      className={inputClass}
                      placeholder="Gxxxxxxxxxx / M001..."
                    />
                  </Field>
                  <Field label="Client Key">
                    <input
                      value={midtransClientKey}
                      onChange={(e) => setMidtransClientKey(e.target.value)}
                      className={inputClass}
                      placeholder="SB-Mid-client-... / Mid-client-..."
                      autoComplete="off"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <SecretField
                      label="Server Key"
                      value={midtransServerKey}
                      onChange={setMidtransServerKey}
                      visible={showMidtransServerKey}
                      onToggleVisible={() =>
                        setShowMidtransServerKey((v) => !v)
                      }
                      placeholder="SB-Mid-server-... / Mid-server-..."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {provider === "xendit" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        activeConfigured
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border border-amber-100 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {activeConfigured ? "Configured" : "Belum lengkap"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Callback: /api/payments/xendit/notification
                    </span>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={xenditProduction}
                      onChange={(e) => setXenditProduction(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Production
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Business / Merchant ID" hint="Opsional">
                    <input
                      value={xenditMerchantId}
                      onChange={(e) => setXenditMerchantId(e.target.value)}
                      className={inputClass}
                      placeholder="opsional"
                    />
                  </Field>
                  <Field label="Callback verification token">
                    <input
                      value={xenditCallbackToken}
                      onChange={(e) => setXenditCallbackToken(e.target.value)}
                      className={inputClass}
                      placeholder="token dari Xendit"
                      autoComplete="off"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <SecretField
                      label="Secret Key"
                      value={xenditSecretKey}
                      onChange={setXenditSecretKey}
                      visible={showXenditSecretKey}
                      onToggleVisible={() => setShowXenditSecretKey((v) => !v)}
                      placeholder="xnd_development_... / xnd_production_..."
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
