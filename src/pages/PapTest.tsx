
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { BeehiivTest } from "@/components/BeehiivTest";
import { supabase } from "@/integrations/supabase/client";
import { useEverflow } from "@/contexts/EverflowContext";

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralId, setReferralId] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { isReady, trackClick } = useEverflow();

  const testClick = async () => {
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    try {
      const tid = await window.EF.click({
        offer_id: window.EF.urlParameter('oid') || 1986,
        affiliate_id: Number(referralId),
        uid: window.EF.urlParameter('uid') || 486,
        sub1: 'test_click'
      });

      setTransactionId(tid);
      toast.success("Click recorded successfully!");
      console.log("Click recorded with transaction ID:", tid);
    } catch (error) {
      console.error("Error testing click:", error);
      toast.error("Click test failed");
    }
  };

  const simulateConversion = async () => {
    if (!referralId || !transactionId) {
      toast.error("Please test a click first");
      return;
    }

    setIsLoading(true);
    try {
      const { conversion_id } = await window.EF.conversion({
        offer_id: window.EF.urlParameter('oid') || 1986,
        transaction_id: transactionId,
        amount: 0,
        email: 'test@example.com'
      });

      // Update entry count in Supabase
      const { error } = await supabase.rpc('increment_referral_count', {
        p_referral_id: referralId
      });

      if (error) throw error;

      toast.success("Conversion simulated successfully!");
      console.log("Conversion recorded:", { conversion_id, transaction_id: transactionId });
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
                <Button
                  onClick={testClick}
                  disabled={!isReady || !referralId}
                  className="w-full mb-2"
                >
                  {isReady ? 'Test Click' : 'Loading Everflow...'}
                </Button>
                <Button
                  onClick={simulateConversion}
                  disabled={isLoading || !referralId || !transactionId}
                  className="w-full"
                >
                  {isLoading ? "Simulating..." : "Simulate Conversion"}
                </Button>
              </div>
            </div>

            {transactionId && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Transaction Details</h2>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-sm break-all">Transaction ID: {transactionId}</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-2">Test Links</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Direct Link Format:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    https://educ8r.freeparentsearch.com/pap-test?uid=486&oid=1986&affid={referralId}
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
            <li>Use the direct link format above with your Referral ID</li>
            <li>Use the "Test Click" button to test click tracking</li>
            <li>Use "Simulate Conversion" to test conversion tracking</li>
            <li>Check your Everflow dashboard to verify the click and conversion</li>
            <li>Check your entry count in Supabase to verify the increment</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
