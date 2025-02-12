
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BeehiivTest = () => {
  const testSetup = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('beehiiv-setup');
      
      if (error) throw error;
      
      console.log('Beehiiv setup response:', data);
      toast.success('Beehiiv setup completed successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to setup Beehiiv');
    }
  };

  return (
    <div className="container mx-auto px-3">
      <Button onClick={testSetup} variant="outline" className="mb-4">
        Test Beehiiv Setup
      </Button>
    </div>
  );
};
