import Navbar from "@/components/Navbar";
import HeroSection from "@/sections/HeroSection";
import ProblemSection from "@/sections/ProblemSection";
import SolutionSection from "@/sections/SolutionSection";
import HowItWorksSection from "@/sections/HowItWorksSection";
import SpecializationSection from "@/sections/SpecializationSection";
import FeaturesSection from "@/sections/FeaturesSection";
import DemoSection from "@/sections/DemoSection";
import ArchitectureSection from "@/sections/ArchitectureSection";
import VisionSection from "@/sections/VisionSection";
import CTASection from "@/sections/CTASection";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SpecializationSection />
      <FeaturesSection />
      <DemoSection />
      <ArchitectureSection />
      <VisionSection />
      <CTASection />
      <Footer />
    </main>
  );
}
