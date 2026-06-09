
import HeroSection from "@/components/beranda/HeroSection";
import SecondSection from "@/components/beranda/SecondSection";
import FourthSection from "@/components/beranda/FourthSection";
import ThirdSection from "@/components/beranda/ThirdSection";
import FifthSection from "@/components/beranda/FifthSection";
import SixthSection from "@/components/beranda/SixthSection";
import SeventhSection from "@/components/beranda/SeventhSection";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export default function Beranda() {
    return (
        <div className="bg-[#1172ba] w-full min-h-screen flex flex-col">
            {/* Pasang komponen Navbar di sini */}
            {/* <Navbar /> */}

            {/* Section Pertama */}
            <HeroSection />

            {/* Section ke 2 */}
            <SecondSection />

            {/* Tambahkan id di sini untuk target scroll */}
            <div id="third-section">
                <ThirdSection />
            </div>
            {/* Section ke 4 */}
            <FourthSection />

            {/* Section ke 5 */}
            <FifthSection />

            {/* Section ke 6 */}
            <SixthSection />

            {/* Section ke 7 */}
            <SeventhSection />

        </div>
    );
}