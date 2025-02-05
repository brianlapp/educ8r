import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load webhook URL from localStorage
    const savedUrl = localStorage.getItem("webhookUrl");
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      console.log("Webhook URL loaded successfully");
    }

    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    document.body.appendChild(script);

    // Listen for messages from Gleam
    const handleMessage = async (event: MessageEvent) => {
      console.log("Message event received:", event.data);

      if (event.data.gleam && event.data.gleam.type === "entry") {
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

          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify(webhookPayload),
          });

          console.log("Webhook request completed");
          
          // Immediately navigate to thank you page after successful form submission
          navigate("/thank-you");
          
        } catch (error) {
          console.error("Error in webhook flow:", error);
          toast({
            title: "Error",
            description: "There was an issue processing your entry. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.removeChild(script);
    };
  }, [navigate, toast, webhookUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F7]">
      <Navbar />
      
      <main className="flex-grow p-4 md:p-8 mt-24">
        <div className="container mx-auto flex flex-col md:flex-row gap-8 items-start">
          {/* CTA Image */}
          <div className="w-full md:w-1/2">
            <img
              src="https://www.sj-r.com/gcdn/authoring/2009/07/27/NSJR/ghows-LS-a101f2fe-bb31-420b-a876-e2a90c5ada65-2c869b53.jpeg?width=1320&height=954&fit=crop&format=pjpg&auto=webp"
              alt="Find Your Parents Today"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
              loading="eager"
            />
          </div>

          {/* Gleam Form Container */}
          <div className="w-full md:w-1/2">
            <a className="e-widget" href="https://gleam.io/dAUCD/instant-entry" rel="nofollow">
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