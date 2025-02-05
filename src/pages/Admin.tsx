import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const Admin = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load webhook URL from localStorage if it exists
    const savedUrl = localStorage.getItem("webhookUrl");
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      console.log("Admin: Loaded existing webhook URL:", savedUrl);
    } else {
      console.log("Admin: No webhook URL found in localStorage");
    }
  }, []);

  const handleSave = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const trimmedUrl = webhookUrl.trim();
      localStorage.setItem("webhookUrl", trimmedUrl);
      console.log("Admin: Successfully saved webhook URL:", trimmedUrl);
      toast({
        title: "Settings saved",
        description: "Your webhook URL has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Zapier Webhook URL
                </label>
                <Input
                  id="webhookUrl"
                  type="text"
                  placeholder="Enter your Zapier webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full max-w-md"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This webhook URL will be used to trigger notifications when users complete the Gleam form.
                </p>
              </div>
              
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;