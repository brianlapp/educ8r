
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load webhook URL from localStorage if it exists
    const savedUrl = localStorage.getItem("webhookUrl");
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("webhookUrl", webhookUrl);
    toast({
      title: "Settings saved",
      description: "Your webhook URL has been saved successfully.",
    });
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
                <input
                  id="webhookUrl"
                  type="text"
                  placeholder="Enter your Zapier webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border rounded-lg"
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
