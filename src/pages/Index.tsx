
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
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
      const response = await fetch("https://api.beehiiv.com/v2/publications/pub_c0cb4ef0-2b78-4ed2-87b1-f8431b2869cd/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          reactivate_existing: false,
          utm_source: window.location.hostname,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been successfully subscribed.",
        });
        navigate("/thank-you");
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
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
    <div className="min-h-screen flex flex-col bg-[#F6F6F7]">
      <Navbar />
      
      <main className="flex-grow p-3 md:p-6 mt-16">
        <div className="container mx-auto flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/2">
            <img
              src="/lovable-uploads/839373db-936e-48b2-9ab4-1e285fc982ed.png"
              alt="School Supplies Giveaway"
              className="w-full h-auto rounded-lg object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="w-full md:w-1/2 min-w-[320px]">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  🎉 Win a $1,000 School Supply Giveaway! 🎉
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Ready to kick off the school year with a bang? Enter our $1,000 School Supply Giveaway for a chance to win everything you need for an awesome academic year! 🎒✏️
                </p>
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
                    By entering your information and clicking Join Now, you agree to our Privacy Policy, Terms and Conditions and understand that we will be sending you our newsletters by email. Unsubscribe at any time.
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
