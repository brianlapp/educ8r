
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [papReferrerId, setPapReferrerId] = useState("");

  const simulateConversion = async () => {
    if (!papReferrerId) {
      toast.error("Please enter a PAP Referrer ID");
      return;
    }

    setIsLoading(true);
    try {
      const testData = {
        refid: papReferrerId,
        clickid: `test_click_${Date.now()}`,
        commission_status: 'approved',
        email: 'test@example.com'
      };

      const { data, error } = await supabase.functions.invoke('pap-webhook', {
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">PAP Integration Test</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                PAP Referrer ID
              </label>
              <input
                type="text"
                value={papReferrerId}
                onChange={(e) => setPapReferrerId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter PAP Referrer ID"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Test Links</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Click Tracking URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {`${window.location.origin}/thank-you?type=click&sweeps=${papReferrerId}`}
                  </code>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Webhook URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    https://xrycgmzgskcbhvdclflj.supabase.co/functions/v1/pap-webhook
                  </code>
                </div>
              </div>
            </div>

            <Button
              onClick={simulateConversion}
              disabled={isLoading || !papReferrerId}
              className="w-full"
            >
              {isLoading ? "Simulating..." : "Simulate Conversion"}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a PAP Referrer ID above</li>
            <li>Copy the Click Tracking URL and visit it in a new tab</li>
            <li>Check the Edge Function logs for click event processing</li>
            <li>Use the "Simulate Conversion" button to test conversion tracking</li>
            <li>Verify the referral count updates in the database</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
