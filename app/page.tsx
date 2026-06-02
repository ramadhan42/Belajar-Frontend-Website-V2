import HeroSection from "@/components/HeroSection";
import SecondSection from "@/components/SecondSection";
import FourthSection from "@/components/FourthSection";
import Image from "next/image";
import ThirdSection from "@/components/ThirdSection";

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
    </div>
  );
}
