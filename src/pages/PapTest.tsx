
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BeehiivTest } from "@/components/BeehiivTest";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    EF: {
      click: (params: any) => Promise<string>;
      conversion: (params: any) => Promise<{ conversion_id: string; transaction_id: string }>;
      urlParameter: (param: string) => string;
      impression: (params: any) => Promise<void>;
    };
    EverflowGlobal: any;
  }
}

const PapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [referralId, setReferralId] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const initializeEverflow = async () => {
      // Fetch Everflow account ID from Supabase
      const { data, error } = await supabase
        .from('everflow_config')
        .select('account_id')
        .single();

      if (error) {
        console.error('Error fetching Everflow config:', error);
        return;
      }

      // Initialize Everflow with global configuration
      window.EverflowGlobal = {
        accountId: data.account_id,
        debug: true
      };

      const script = document.createElement('script');
      script.src = "https://www.eflow.team/scripts/sdk/everflow.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        try {
          const affid = window.EF.urlParameter('affid');
          if (affid) {
            setReferralId(affid);
            
            // Track impression
            window.EF.impression({
              offer_id: window.EF.urlParameter('oid') || 1986,
              affiliate_id: Number(affid),
              uid: window.EF.urlParameter('uid') || 486,
              sub1: 'test_impression'
            }).then(() => {
              console.log('Impression tracked successfully');
            }).catch((error) => {
              console.error('Error tracking impression:', error);
            });
          }
        } catch (error) {
          console.error('Error processing URL parameters:', error);
        }
      };
    };

    initializeEverflow();

    return () => {
      const script = document.querySelector('script[src="https://www.eflow.team/scripts/sdk/everflow.js"]');
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const testClick = async () => {
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    if (typeof window.EF === 'undefined') {
      toast.error("Everflow SDK not loaded yet. Please try again.");
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
    if (!referralId) {
      toast.error("Please enter a Referral ID");
      return;
    }

    if (typeof window.EF === 'undefined') {
      toast.error("Everflow SDK not loaded yet. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const { conversion_id, transaction_id } = await window.EF.conversion({
        offer_id: window.EF.urlParameter('oid') || 1986,
        transaction_id: transactionId,
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
