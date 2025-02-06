
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
    console.log("Setting up Gleam integration and event listeners...");
    
    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    document.body.appendChild(script);

    // Listen for ALL messages
    const handleMessage = async (event: MessageEvent) => {
      console.log("=== Message Event Received ===");
      console.log("Raw event:", event);
      console.log("Event origin:", event.origin);
      console.log("Event data:", event.data);
      
      if (event.data.gleam) {
        console.log("Gleam event details:", {
          type: event.data.gleam.type,
          campaign: event.data.gleam.campaign,
          contestant: event.data.gleam.contestant
        });
      }

      // Check for form submission events
      if (event.data.gleam?.type === "entry") {
        console.log("Entry event detected! Attempting to process...");
        
        try {
          console.log("Processing entry data:", event.data.gleam);
          
          // Get the webhook URL from our database
          console.log("Fetching webhook URL...");
          const { data: webhookConfig, error: webhookError } = await supabase
            .from('webhook_configs')
            .select('zapier_webhook_url')
            .limit(1)
            .single();

          if (webhookError) {
            console.error("Error fetching webhook URL:", webhookError);
            throw webhookError;
          }

          if (!webhookConfig?.zapier_webhook_url) {
            console.error('No Zapier webhook URL found in config');
            throw new Error('No Zapier webhook URL configured');
          }

          // Forward the entry data to Zapier
          console.log("Sending data to Zapier webhook:", webhookConfig.zapier_webhook_url);
          const zapierResponse = await fetch(webhookConfig.zapier_webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify({
              ...event.data.gleam,
              timestamp: new Date().toISOString()
            }),
          });

          console.log("Zapier webhook request completed");

          // Store the submission in our database
          console.log("Storing submission in database...");
          const { error: submissionError } = await supabase
            .from('form_submissions')
            .insert([
              {
                submission_data: event.data.gleam,
                processed: true
              }
            ]);

          if (submissionError) {
            console.error("Error storing submission:", submissionError);
            throw submissionError;
          }

          console.log("Submission stored successfully");
          toast({
            title: "Success!",
            description: "Your entry has been submitted successfully.",
          });

          // Force navigation to thank you page after a short delay
          console.log("Attempting navigation to thank you page...");
          setTimeout(() => {
            console.log("Executing navigation...");
            navigate("/thank-you", { replace: true });
          }, 1000);

        } catch (error) {
          console.error("Error processing entry:", error);
          toast({
            title: "Error",
            description: "There was an error submitting your entry. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    console.log("Adding message event listener...");
    window.addEventListener("message", handleMessage);
    
    return () => {
      console.log("Cleaning up Gleam integration...");
      window.removeEventListener("message", handleMessage);
      document.body.removeChild(script);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F7]">
      <Navbar />
      
      <main className="flex-grow p-4 md:p-8 mt-24">
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

          <div className="w-full md:w-2/5 min-w-[400px]">
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
