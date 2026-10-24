import { Approach } from "@/components/Approach";
import { Competitors } from "@/components/Competitors";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Install } from "@/components/Install";
import { Nav } from "@/components/Nav";
import { Opportunities } from "@/components/Opportunities";
import { SampleReport } from "@/components/SampleReport";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Opportunities />
        <Competitors />
        <Approach />
        <HowItWorks />
        <SampleReport />
        <Install />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
