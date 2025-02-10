
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const endDate = new Date('2025-04-11T23:59:59');
    
    const timer = setInterval(() => {
      const now = new Date();
      const days = differenceInDays(endDate, now);
      const hours = differenceInHours(endDate, now) % 24;
      const minutes = differenceInMinutes(endDate, now) % 60;
      const seconds = differenceInSeconds(endDate, now) % 60;
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      
      // Get or create sweepstakes entry first
      const { data: sweepstakesData, error: sweepstakesError } = await supabase
        .from('sweepstakes')
        .select()
        .eq('is_active', true)
        .single();

      if (sweepstakesError) {
        throw sweepstakesError;
      }

      const sweepstakes_id = sweepstakesData.id;
      
      // Store in form_submissions table with submission_data
      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .insert([
          {
            submission_data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              sweepstakes_id
            },
            processed: false
          }
        ])
        .select();

      if (submissionError) {
        throw submissionError;
      }

      // Call Beehiiv edge function
      const { data: beehiivData, error: beehiivError } = await supabase.functions.invoke('beehiiv-sync', {
        body: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          sweepstakes_id
        }
      });

      if (beehiivError) {
        // Check if it's a duplicate entry error
        if (beehiivError.message && beehiivError.message.includes('duplicate_entry')) {
          toast({
            variant: "destructive",
            title: "Already Entered",
            description: "You have already entered this sweepstakes.",
          });
          // Still navigate to thank you page with the email
          navigate(`/thank-you?email=${encodeURIComponent(formData.email)}&sweepstakes_id=${sweepstakes_id}`);
          return;
        }
        console.error('Beehiiv sync error:', beehiivError);
        throw beehiivError;
      }

      // Store in newsletter_submissions table (keeping existing functionality)
      const { error: newsletterError } = await supabase
        .from('newsletter_submissions')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email
          }
        ]);

      if (newsletterError) {
        throw newsletterError;
      }

      toast({
        title: "Success!",
        description: "You've been successfully subscribed.",
      });
      
      // Pass email and sweepstakes_id to thank you page
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow mt-16">
        <section className="py-12">
          <div className="container mx-auto px-3 flex flex-col md:flex-row gap-6 items-start">
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
        </section>

        <section className="py-12 bg-[#F1F1F1]">
          <div className="container mx-auto px-3">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-2">Time Left to Enter!</h2>
                <div className="flex justify-center space-x-4 text-center mt-4">
                  <div className="bg-[#F1F1F1] px-4 py-2 rounded-lg">
                    <div className="text-3xl font-bold text-[#15b0f8]">{timeLeft.days}</div>
                    <div className="text-sm text-[#15b0f8]">Days</div>
                  </div>
                  <div className="bg-[#F1F1F1] px-4 py-2 rounded-lg">
                    <div className="text-3xl font-bold text-[#15b0f8]">{timeLeft.hours}</div>
                    <div className="text-sm text-[#15b0f8]">Hours</div>
                  </div>
                  <div className="bg-[#F1F1F1] px-4 py-2 rounded-lg">
                    <div className="text-3xl font-bold text-[#15b0f8]">{timeLeft.minutes}</div>
                    <div className="text-sm text-[#15b0f8]">Minutes</div>
                  </div>
                  <div className="bg-[#F1F1F1] px-4 py-2 rounded-lg">
                    <div className="text-3xl font-bold text-[#15b0f8]">{timeLeft.seconds}</div>
                    <div className="text-sm text-[#15b0f8]">Seconds</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center px-8 pb-8">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ready to kick off the school year with a bang? Enter our $1,000 School Supply Giveaway for a chance to win everything you need for an awesome academic year! 🎒✏️
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
