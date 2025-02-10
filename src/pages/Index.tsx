
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load Beehiiv embed script
    const script = document.createElement('script');
    script.src = 'https://embeds.beehiiv.com/js/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Clean up on unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F7]">
      <Navbar />
      
      <main className="flex-grow p-3 md:p-6 mt-16">
        <div className="container mx-auto flex flex-col md:flex-row gap-0 items-start">
          <div className="w-full md:w-1/2">
            <img
              src="/lovable-uploads/839373db-936e-48b2-9ab4-1e285fc982ed.png"
              alt="School Supplies Giveaway"
              className="w-full h-auto rounded-lg object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="w-full md:w-1/2 min-w-[320px] p-4">
            <div 
              data-beehiiv-embed="true"
              className="beehiiv-embed"
            ></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
