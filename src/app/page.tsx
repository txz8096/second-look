import { Approach } from "@/components/Approach";
import { Competitors } from "@/components/Competitors";
import { Coverage } from "@/components/Coverage";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Install } from "@/components/Install";
import { Nav } from "@/components/Nav";
import { Opportunities } from "@/components/Opportunities";
import { Privacy } from "@/components/Privacy";
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
        <Privacy />
        <Coverage />
        <SampleReport />
        <Install />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
