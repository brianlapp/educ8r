
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [papReferrerId, setPapReferrerId] = useState("");
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);

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

  const createTestEntry = async () => {
    if (!papReferrerId) {
      toast.error("Please enter a PAP Referrer ID");
      return;
    }

    setIsCreatingEntry(true);
    try {
      const { data, error } = await supabase
        .from('sweepstakes_entries')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          terms_accepted: true,
          pap_affiliate_id: papReferrerId,
          beehiiv_subscriber_id: 'test_subscriber_123' // Adding this for Beehiiv testing
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Test entry created successfully!");
      console.log("Created entry:", data);
    } catch (error) {
      console.error("Error creating test entry:", error);
      toast.error("Failed to create test entry");
    } finally {
      setIsCreatingEntry(false);
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
                  <p className="text-sm font-medium">Click Test URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {`${window.location.origin}/pap-test-click?sweeps=${papReferrerId}`}
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

            <div className="flex flex-col gap-2">
              <Button
                onClick={createTestEntry}
                disabled={isCreatingEntry || !papReferrerId}
                className="w-full"
                variant="outline"
              >
                {isCreatingEntry ? "Creating..." : "1. Create Test Entry"}
              </Button>

              <Button
                onClick={simulateConversion}
                disabled={isLoading || !papReferrerId}
                className="w-full"
              >
                {isLoading ? "Simulating..." : "2. Simulate Conversion"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a PAP Referrer ID above</li>
            <li>Click "Create Test Entry" to create an entry in the database</li>
            <li>Copy the Click Test URL and visit it in a new tab</li>
            <li>The test page will process the click and show results</li>
            <li>Use the "Simulate Conversion" button to test conversion tracking</li>
            <li>Verify the referral count updates in the database</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
