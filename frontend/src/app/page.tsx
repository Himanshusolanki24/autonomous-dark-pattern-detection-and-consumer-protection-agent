import { Navbar } from "@/components/landing/Navbar";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SeeTheTrap } from "@/components/landing/SeeTheTrap";
import { AgentPipeline } from "@/components/landing/AgentPipeline";
import { AgentDifference } from "@/components/landing/AgentDifference";
import { EvidenceSection } from "@/components/landing/EvidenceSection";
import { SafetySection } from "@/components/landing/SafetySection";
import { VerificationSection } from "@/components/landing/VerificationSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { DemoSection } from "@/components/landing/DemoSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <SeeTheTrap />
        <AgentPipeline />
        <AgentDifference />
        <EvidenceSection />
        <SafetySection />
        <VerificationSection />
        <SecuritySection />
        <DemoSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
