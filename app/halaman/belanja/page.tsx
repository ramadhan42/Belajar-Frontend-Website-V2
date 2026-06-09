import FirstSectionBelanja from "@/components/belanja/FirstSectionBelanja";
import SecondSectionBelanja from "@/components/belanja/SecondSectionBelanja";
import Footer from "@/components/global/Footer";

export default function Belanja() {
    return (
        <div>
            <div className="bg-[#F6F6F6] flex flex-col justify-center items-center min-h-screen">

                {/* Konten belanja akan ditampilkan di sini */}
                <FirstSectionBelanja />
                <SecondSectionBelanja />
            </div>
            <Footer />
        </div>



    );
}