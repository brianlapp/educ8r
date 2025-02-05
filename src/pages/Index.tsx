import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [webhookUrl, setWebhookUrl] = useState("");
  
  useEffect(() => {
    // Load webhook URL from localStorage
    const savedUrl = localStorage.getItem("webhookUrl");
    if (!savedUrl) {
      console.warn("No webhook URL found in localStorage - redirecting to admin");
      toast({
        title: "Setup Required",
        description: "Please configure the webhook URL in the admin panel first.",
      });
      navigate("/admin");
      return;
    }
    setWebhookUrl(savedUrl);
    console.log("Webhook URL loaded successfully");

    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    
    window.addEventListener('message', async (event) => {
      console.log("Message event received:", event.data);
      
      if (event.data && event.data.gleam && event.data.gleam.type === 'campaign_entry') {
        console.log("Gleam entry detected:", event.data.gleam);
        
        try {
          const webhookPayload = {
            timestamp: new Date().toISOString(),
            entry: event.data.gleam,
            source: window.location.origin,
            tags: ["freeparentsearch", "gleam-entry"],
            user_data: {
              ...event.data.gleam.participant,
              entry_type: event.data.gleam.type
            }
          };

          console.log("Sending webhook payload:", webhookPayload);

          const response = await fetch(savedUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify(webhookPayload),
          });

          console.log("Webhook request completed");
          
          toast({
            title: "Thank you for entering!",
            description: "You will be redirected shortly...",
          });

          setTimeout(() => {
            console.log("Navigating to thank you page...");
            navigate("/thank-you");
          }, 2000);
          
        } catch (error) {
          console.error("Error in webhook flow:", error);
          toast({
            title: "Error",
            description: "There was an issue processing your entry. Please try again.",
            variant: "destructive",
          });
        }
      }
    });
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [toast, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center lg:items-start relative">
              <div className="w-full lg:w-1/3 flex lg:justify-end lg:pr-0">
                <img 
                  src="/lovable-uploads/eb280041-c9b0-4439-87b7-33752d951703.png"
                  alt="Giveaway prizes"
                  className="max-w-[300px] lg:max-w-full w-full object-contain rounded-lg"
                />
              </div>
              
              <div className="w-full lg:w-2/3 lg:-ml-5 z-10">
                <div className="w-full min-h-[500px] p-4">
                  <a 
                    className="e-widget" 
                    href="https://gleam.io/dAUCD/instant-entry" 
                    rel="nofollow"
                  >
                    Instant Entry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;