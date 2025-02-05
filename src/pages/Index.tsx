
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
    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    
    // Handle Gleam completion event
    window.addEventListener('message', async (event) => {
      // Check if the message is from Gleam and indicates completion
      if (event.data && event.data.gleam && event.data.gleam.type === 'campaign_entry') {
        console.log("Gleam entry completed, triggering webhook");
        
        try {
          // Call Zapier webhook
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              entry: event.data.gleam,
              source: window.location.origin
            }),
          });

          toast({
            title: "Thank you for entering!",
            description: "You will be redirected shortly...",
          });

          // Redirect after a short delay
          setTimeout(() => {
            navigate("/thank-you");
          }, 2000);
          
        } catch (error) {
          console.error("Error triggering webhook:", error);
          toast({
            title: "Error",
            description: "There was an issue processing your entry.",
            variant: "destructive",
          });
        }
      }
    });
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [webhookUrl, toast, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          {/* Webhook URL input - you might want to move this to an admin panel */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your Zapier webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center lg:items-start relative">
              {/* Image section - aligned right on desktop */}
              <div className="w-full lg:w-1/3 flex lg:justify-end lg:pr-0">
                <img 
                  src="/lovable-uploads/eb280041-c9b0-4439-87b7-33752d951703.png"
                  alt="Giveaway prizes"
                  className="max-w-[300px] lg:max-w-full w-full object-contain rounded-lg"
                />
              </div>
              
              {/* Widget section - aligned left and overlapping */}
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
