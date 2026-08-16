import { Navbar } from "@/components/landing/Navbar";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { AgentSection } from "@/components/landing/AgentSection";
import { AgentPipeline } from "@/components/landing/AgentPipeline";
import { DetectionSection } from "@/components/landing/DetectionSection";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { SafetySection } from "@/components/landing/SafetySection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { RegulatorySection } from "@/components/landing/RegulatorySection";
import { VisionSection } from "@/components/landing/VisionSection";
import { Roadmap } from "@/components/landing/Roadmap";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <AgentSection />
        <AgentPipeline />
        <DetectionSection />
        <LiveDemo />
        <SafetySection />
        <PrivacySection />
        <RegulatorySection />
        <VisionSection />
        <Roadmap />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}