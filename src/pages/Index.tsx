
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
    // Load attribution tracking script
    const script = document.createElement('script');
    script.src = 'https://embeds.beehiiv.com/attribution.js';
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
            <iframe 
              src="https://embeds.beehiiv.com/c0cb4ef0-2b78-4ed2-87b1-f8431b2869cd"
              data-test-id="beehiiv-embed" 
              width="100%" 
              height="320" 
              frameBorder="0" 
              scrolling="no" 
              style={{
                borderRadius: '4px',
                border: '2px solid #e5e7eb',
                margin: 0,
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
