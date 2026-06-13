import FirstSectionBelanja from "@/components/belanja/FirstSectionBelanja";
import SecondSectionBelanja from "@/components/belanja/SecondSectionBelanja";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export default function Belanja() {
    return (
        <div>
            <div className="bg-[#1172BA] flex flex-col justify-center items-center min-h-screen">
               
                {/* Konten belanja akan ditampilkan di sini */}
                <FirstSectionBelanja />
                <SecondSectionBelanja />
                
            </div>
        </div>
    );
}