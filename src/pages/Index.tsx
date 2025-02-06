
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
    // Load SweepWidget script
    const script = document.createElement('script');
    script.src = 'https://sweepwidget.com/w/j/w_init.js';
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
      
      <main className="flex-grow p-3 md:p-6 mt-16"> {/* Reduced padding and margin-top */}
        <div className="container mx-auto flex flex-col md:flex-row gap-0 items-start">
          <div className="w-full md:w-3/5">
            <img
              src="/lovable-uploads/839373db-936e-48b2-9ab4-1e285fc982ed.png"
              alt="School Supplies Giveaway"
              className="w-full h-auto rounded-lg object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="w-full md:w-2/5 min-w-[320px]"> {/* Reduced min-width */}
            <div id="88241-zok3fc2t" className="sw_container"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
