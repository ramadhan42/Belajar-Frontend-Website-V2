import HeroSection from "@/components/HeroSection";
import SecondSection from "@/components/SecondSection";
import FourthSection from "@/components/FourthSection";
import ThirdSection from "@/components/ThirdSection";
import FifthSection from "@/components/FifthSection";
import SixthSection from "@/components/SixthSection";
import SeventhSection from "@/components/SeventhSection";
import Footer from "@/components/Footer";
import SlideToRightSectionLearn from "@/components/SlideToRightLearn";

export default function Home() {
  return (
    <div>
      {/* Section Pertama */}
      <HeroSection />

      {/* Section ke 2 */}
      <SecondSection />

      {/* Section ke 3 */}
      <ThirdSection />

      {/* Section ke 4 */}
      <FourthSection />

      {/* Section ke 5 */}
      <FifthSection />

      {/* Section ke 6 */}
      <SixthSection/>

      {/* Section ke 7 */}
      <SeventhSection/>

      {/* Section ke 8 (Footer) */}
      <Footer />
    </div>
  );
}
