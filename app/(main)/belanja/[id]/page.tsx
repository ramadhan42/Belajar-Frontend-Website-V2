"use client"; // Wajib ada di baris pertama file!

import ProductDetailSection from "@/components/belanja-details/ProductDetailSection";
import Footer from "@/components/global/Footer";

export default function BelanjaDetails() {
  return (
    <div className="bg-[#1172BA] flex flex-col justify-center items-center">
      <ProductDetailSection />
    </div>
  );
}
