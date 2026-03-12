import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero, Features, TechStack, CTA } from "@/components/landing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-screen-xl flex-1 px-4">
        <Hero />
        <Features />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
