
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BeehiivTest } from "@/components/BeehiivTest";

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralId, setReferralId] = useState("");

  const simulateConversion = async () => {
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    setIsLoading(true);
    try {
      const testData = {
        refid: referralId,
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

  const testClick = async () => {
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('pap-webhook', {
        body: {
          type: 'click',
          sweeps: referralId
        }
      });

      if (error) throw error;
      toast.success("Click test successful!");
      console.log("Click test response:", data);
    } catch (error) {
      console.error("Error testing click:", error);
      toast.error("Click test failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto space-y-8">
        <BeehiivTest />
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Referral Testing Tool</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Referral ID
              </label>
              <input
                type="text"
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter the Referral ID from your thank you page"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
              <div className="space-y-2">
                <div>
                  <Button
                    onClick={testClick}
                    disabled={!referralId}
                    className="w-full mb-2"
                  >
                    Test Click
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={simulateConversion}
                    disabled={isLoading || !referralId}
                    className="w-full"
                  >
                    {isLoading ? "Simulating..." : "Simulate Conversion"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Test Links</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Click Test URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {`${window.location.origin}/pap-test-click?sweeps=${referralId}`}
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the main form and submit your entry with your real email</li>
            <li>Copy your Referral ID from the thank you page</li>
            <li>Paste your Referral ID above</li>
            <li>Use the "Test Click" button to test click tracking</li>
            <li>Use "Simulate Conversion" to test conversion tracking</li>
            <li>Check your Beehiiv dashboard to verify the subscriber update</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
