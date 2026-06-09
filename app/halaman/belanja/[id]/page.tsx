import ProductDetailSection from "@/components/belanja-details/ProductDetailSection";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export default function BelanjaDetails() {
    return (
        <main className="bg-[#F6F6F6] w-full min-h-screen flex flex-col">
            <Navbar />

            {/* 1. flex-grow: Memastikan div ini mengambil sisa ruang antara Navbar dan Footer.
              2. flex justify-center items-center: Membuat konten di dalamnya berada tepat di tengah.
            */}
            <div className="flex-grow flex flex-col justify-center items-center pt-5 text-center">
                <ProductDetailSection />
            </div>

            <Footer />
        </main>
    );
}