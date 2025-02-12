
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EntryForm } from "@/components/sweepstakes/EntryForm";
import { CountdownTimer } from "@/components/sweepstakes/CountdownTimer";
import { useCountdown } from "@/hooks/useCountdown";
import { BeehiivTest } from "@/components/BeehiivTest";

const Index = () => {
  const timeLeft = useCountdown(new Date('2025-04-11T23:59:59'));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow mt-16">
        <BeehiivTest />
        <section className="py-12">
          <div className="container mx-auto px-3 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/2">
              <img
                src="/lovable-uploads/839373db-936e-48b2-9ab4-1e285fc982ed.png"
                alt="School Supplies Giveaway"
                className="w-full h-auto rounded-lg object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <EntryForm />
          </div>
        </section>

        <CountdownTimer timeLeft={timeLeft} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
