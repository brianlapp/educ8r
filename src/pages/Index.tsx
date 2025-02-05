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
    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    document.body.appendChild(script);

    // Listen for messages from Gleam
    const handleMessage = async (event: MessageEvent) => {
      console.log("Message event received:", event.data);
      
      if (event.data.gleam && event.data.gleam.type === "entry") {
        console.log("Index: Gleam entry detected:", event.data.gleam);
        
        try {
          // Forward the entry data to our webhook handler
          const { data, error } = await supabase.functions.invoke('webhook-handler', {
            body: event.data.gleam
          });

          if (error) throw error;

          toast({
            title: "Success!",
            description: "Your entry has been submitted successfully.",
          });

          // Add a small delay before navigation to ensure the toast is visible
          setTimeout(() => {
            navigate("/thank-you");
          }, 1000);
        } catch (error) {
          console.error("Error forwarding entry:", error);
          toast({
            title: "Error",
            description: "There was an error submitting your entry. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.removeChild(script);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F7]">
      <Navbar />
      
      <main className="flex-grow p-4 md:p-8 mt-24">
        <div className="container mx-auto flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/2">
            <img
              src="https://www.sj-r.com/gcdn/authoring/2009/07/27/NSJR/ghows-LS-a101f2fe-bb31-420b-a876-e2a90c5ada65-2c869b53.jpeg?width=1320&height=954&fit=crop&format=pjpg&auto=webp"
              alt="Find Your Parents Today"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
              loading="eager"
            />
          </div>

          <div className="w-full md:w-1/2 min-w-[400px]">
            <style>
              {`
                .gleam-widget-container .entry-method {
                  display: block !important;
                }
                .gleam-widget-container .entry-button {
                  display: none !important;
                }
              `}
            </style>
            <a 
              className="e-widget" 
              href="https://gleam.io/dAUCD/instant-entry?full=1" 
              rel="nofollow"
            >
              Instant Entry
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;