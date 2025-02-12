
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PapTestClick = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    const processClick = async () => {
      const sweepsParam = searchParams.get('sweeps');
      
      if (!sweepsParam) {
        setResult("Error: No sweeps parameter found");
        setIsProcessing(false);
        return;
      }

      try {
        // Call the webhook with click event type
        const { data, error } = await supabase.functions.invoke('pap-webhook', {
          body: {
            type: 'click',
            sweeps: sweepsParam
          }
        });

        if (error) throw error;

        setResult("Click processed successfully! You can close this window.");
        toast.success("Click tracked successfully!");
        console.log("Click tracking response:", data);
      } catch (error) {
        console.error("Error processing click:", error);
        setResult(`Error processing click: ${error.message}`);
        toast.error("Failed to track click");
      } finally {
        setIsProcessing(false);
      }
    };

    processClick();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">PAP Click Test</h1>
        
        {isProcessing ? (
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Processing click...</p>
          </div>
        ) : (
          <div className="text-center">
            <p className={result.includes("Error") ? "text-red-500" : "text-green-500"}>
              {result}
            </p>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              Params: {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PapTestClick;
