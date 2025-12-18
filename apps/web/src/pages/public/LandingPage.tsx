import {
  HeroSectionNew,
  PillarsSection,
  TechShowcaseSection,
  StatsSection,
  HowItWorksSection,
  MapScaleSection,
  GenealogySection,
  UseCasesSection,
  TrustStripSection,
  CTASection,
  FooterSection,
} from '@/components/landing/sections';
import { GradientSeparator, ParticlesBackground } from '@/components/landing';

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">

      <ParticlesBackground particleCount={60} />


      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>

        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep" />


        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0 bg-hero-gradient-2 opacity-40" />
        <div className="absolute inset-0 bg-hero-gradient-3 opacity-30" />


        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />


        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />


        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      </div>


      <div className="relative z-10">
        <HeroSectionNew />

        <GradientSeparator variant="glow" />

        <StatsSection />

        <GradientSeparator variant="default" />

        <PillarsSection />

        <GradientSeparator variant="fade" />

        <TechShowcaseSection />

        <GradientSeparator variant="glow" />

        <HowItWorksSection />

        <GradientSeparator variant="default" />

        <MapScaleSection />

        <GradientSeparator variant="fade" />

        <GenealogySection />

        <GradientSeparator variant="glow" />

        <UseCasesSection />

        <TrustStripSection />

        <CTASection />

        <FooterSection />
      </div>
    </div>
  );
}
