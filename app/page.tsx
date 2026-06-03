import HeroSection from "@/components/HeroSection";
import SecondSection from "@/components/SecondSection";
import FourthSection from "@/components/FourthSection";
import ThirdSection from "@/components/ThirdSection";
import FifthSection from "@/components/FifthSection";

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
    </div>
  );
}
