import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export default function Kuis() {
    return (
        <div className="bg-[#1172BA] flex flex-col justify-center items-center min-h-screen">
            <Navbar />

            <div className="text-white text-3xl font-bold mt-20">
                Halaman Kuis
            </div>
            <Footer />
        </div>
    );
}