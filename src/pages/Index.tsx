
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#F1F1F1] border-transparent focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 text-lg transition-colors"
                >
                  {isLoading ? "Processing..." : "Continue →"}
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
