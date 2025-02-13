
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BeehiivTest } from "@/components/BeehiivTest";

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateId, setAffiliateId] = useState("");
  const [email, setEmail] = useState("");

  const simulateConversion = async () => {
    if (!affiliateId) {
      toast.error("Please enter an Affiliate ID");
      return;
    }

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const testData = {
        affiliate_id: affiliateId,
        email: email,
        firstName: "Test",
        lastName: "User"
      };

      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: testData
      });

      if (error) throw error;

      toast.success("Conversion simulated successfully!");
      console.log("Webhook response:", data);
    } catch (error) {
      console.error("Error simulating conversion:", error);
      toast.error("Failed to simulate conversion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto space-y-8">
        <BeehiivTest />
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Everflow Testing Tool</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Affiliate ID
              </label>
              <input
                type="text"
                value={affiliateId}
                onChange={(e) => setAffiliateId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter the Affiliate ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Test Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter test email address"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
              <div className="space-y-2">
                <div>
                  <Button
                    onClick={simulateConversion}
                    disabled={isLoading || !affiliateId || !email}
                    className="w-full"
                  >
                    {isLoading ? "Simulating..." : "Simulate Conversion"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Webhook URL</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Webhook URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    https://xrycgmzgskcbhvdclflj.supabase.co/functions/v1/webhook-handler
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter an Affiliate ID (use "1" for testing)</li>
            <li>Enter a test email address</li>
            <li>Click "Simulate Conversion" to test Everflow tracking</li>
            <li>Check your Everflow dashboard to verify the conversion</li>
            <li>Check Beehiiv dashboard to verify the subscriber update</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
