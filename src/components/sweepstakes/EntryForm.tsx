
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export const EntryForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      toast({
        variant: "destructive",
        title: "Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting form data:', formData);
      
      // Get active sweepstakes
      const { data: sweepstakesData, error: sweepstakesError } = await supabase
        .from('sweepstakes')
        .select()
        .eq('is_active', true)
        .single();

      if (sweepstakesError) {
        throw sweepstakesError;
      }

      const sweepstakes_id = sweepstakesData.id;

      // Create sweepstakes entry
      const { error: entryError } = await supabase
        .from('sweepstakes_entries')
        .insert([
          {
            sweepstakes_id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            terms_accepted: agreed
          }
        ]);

      if (entryError) {
        throw entryError;
      }

      // Call webhook handler
      const { error: webhookError } = await supabase.functions.invoke('webhook-handler', {
        body: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          sweepstakes_id
        }
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        throw webhookError;
      }

      toast({
        title: "Success!",
        description: "You've been successfully subscribed.",
      });
      
      navigate(`/thank-you?email=${encodeURIComponent(formData.email)}&sweepstakes_id=${sweepstakes_id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem subscribing you. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 min-w-[320px]">
      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            🎉 Win a $1,000 School Supply Giveaway! 🎉
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <Input
              type="text"
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] h-12 text-lg"
            />
            <Input
              type="text"
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] h-12 text-lg"
            />
            <Input
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] h-12 text-lg"
            />
          </div>

          <div className="flex items-start space-x-2 mt-6">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-relaxed"
            >
              By entering your information and clicking Join Now, you agree to our{" "}
              <Link to="/legal/privacy_policy" className="text-blue-600 hover:underline">Privacy Policy</Link>,{" "}
              <Link to="/legal/terms_conditions" className="text-blue-600 hover:underline">Terms and Conditions</Link>{" "}
              and understand that we will be sending you our newsletters by email. Unsubscribe at any time.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-8 text-xl rounded-lg transition-all duration-300 mt-6"
          >
            {isLoading ? "Processing..." : "Enter to Win! →"}
          </Button>
        </form>
      </div>
    </div>
  );
};
