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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 space-y-8">
        {/* CTA Image */}
        <div className="w-full max-w-2xl mb-8">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
            alt="Find Your Parents Today"
            className="w-full h-auto rounded-lg shadow-lg"
            loading="eager"
          />
        </div>

        {/* Gleam Form Container */}
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <a className="e-widget" href="https://gleam.io/dAUCD/instant-entry" rel="nofollow">
            Instant Entry
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;