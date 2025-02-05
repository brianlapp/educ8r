import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const Admin = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Try to load webhook URL from multiple storage locations
    const localStorageUrl = localStorage.getItem("webhookUrl");
    const sessionStorageUrl = sessionStorage.getItem("webhookUrl");
    
    if (localStorageUrl || sessionStorageUrl) {
      const savedUrl = localStorageUrl || sessionStorageUrl;
      setWebhookUrl(savedUrl || "");
      
      // Ensure URL is saved in both storage locations
      if (localStorageUrl && !sessionStorageUrl) {
        sessionStorage.setItem("webhookUrl", localStorageUrl);
      } else if (!localStorageUrl && sessionStorageUrl) {
        localStorage.setItem("webhookUrl", sessionStorageUrl);
      }
      
      console.log("Admin: Loaded existing webhook URL:", savedUrl);
    } else {
      console.log("Admin: No webhook URL found in storage");
    }
  }, []);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(webhookUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL format",
        variant: "destructive",
      });
      return;
    }

    try {
      const trimmedUrl = webhookUrl.trim();
      
      // Save to both storage locations
      localStorage.setItem("webhookUrl", trimmedUrl);
      sessionStorage.setItem("webhookUrl", trimmedUrl);
      
      console.log("Admin: Successfully saved webhook URL:", trimmedUrl);
      
      // Verify the save was successful
      const savedLocal = localStorage.getItem("webhookUrl");
      const savedSession = sessionStorage.getItem("webhookUrl");
      
      if (savedLocal === trimmedUrl && savedSession === trimmedUrl) {
        toast({
          title: "Settings saved",
          description: "Your webhook URL has been saved successfully.",
        });
      } else {
        throw new Error("Verification failed");
      }
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
                  type="url"
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