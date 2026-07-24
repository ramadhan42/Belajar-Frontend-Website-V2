import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample Evomi — Waitlist (scraped)",
  description:
    "Sample page hasil scrap landing waitlist dari https://evomi.id/",
  robots: { index: false, follow: false },
};

export default function SampleEvomiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      {children}
    </div>
  );
}
