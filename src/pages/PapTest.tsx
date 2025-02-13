
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BeehiivTest } from "@/components/BeehiivTest";

declare global {
  interface Window {
    EF: {
      click: (params: any) => Promise<string>;
      conversion: (params: any) => Promise<{ conversion_id: string; transaction_id: string }>;
    };
  }
}

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralId, setReferralId] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Add Everflow SDK script
    const script = document.createElement('script');
    script.src = "https://www.eflow.team/scripts/sdk/everflow.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const testClick = async () => {
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    if (!window.EF) {
      toast.error("Everflow SDK not loaded yet. Please try again.");
      return;
    }
    
    try {
      const tid = await window.EF.click({
        offer_id: 1,
        affiliate_id: Number(referralId),
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
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    if (!window.EF) {
      toast.error("Everflow SDK not loaded yet. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const { conversion_id, transaction_id } = await window.EF.conversion({
        offer_id: 1,
        transaction_id: transactionId, // Use the stored transaction ID from the click
        amount: 0,
        email: 'test@example.com'
      });

      console.log("Conversion recorded:", { conversion_id, transaction_id });

      // Now update entry count in Supabase
      const { error } = await supabase.rpc('increment_referral_count', {
        p_referral_id: referralId
      });

      if (error) throw error;

      toast.success("Conversion simulated successfully!");
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
                    disabled={isLoading || !referralId || !transactionId}
                    className="w-full"
                  >
                    {isLoading ? "Simulating..." : "Simulate Conversion"}
                  </Button>
                </div>
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
                  <p className="text-sm font-medium">Click Test URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                    {`${window.location.origin}/pap-test-click?sweeps=${referralId}`}
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
            <li>Check your Everflow dashboard to verify the click and conversion</li>
            <li>Check your entry count in Supabase to verify the increment</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PapTest;
