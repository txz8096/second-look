import { Approach } from "@/components/Approach";
import { Coverage } from "@/components/Coverage";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Install } from "@/components/Install";
import { Nav } from "@/components/Nav";
import { Opportunities } from "@/components/Opportunities";
import { Privacy } from "@/components/Privacy";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Opportunities />
        <Approach />
        <Coverage />
        <Privacy />
        <Install />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
