
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link2, Mail, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const ThankYou = () => {
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [referralUrl, setReferralUrl] = useState("");
  const [entryCount, setEntryCount] = useState(1);
  const location = useLocation();

  useEffect(() => {
    const initializePage = async () => {
      // Get referral data from URL if any
      const urlParams = new URLSearchParams(location.search);
      const referralCode = urlParams.get('ref');
      const email = urlParams.get('email');
      const sweepstakesId = urlParams.get('sweepstakes_id');
      
      if (email && sweepstakesId) {
        try {
          // Fetch current entry count
          const { data: entryData, error: entryError } = await supabase
            .from('sweepstakes_entries')
            .select('entry_count, referral_count')
            .eq('email', email)
            .eq('sweepstakes_id', sweepstakesId)
            .single();

          if (entryError) throw entryError;
          if (entryData) {
            setEntryCount(entryData.entry_count);
          }

          // Store the submission with referral data if present
          const { data: submissionData, error: submissionError } = await supabase
            .from('form_submissions')
            .insert([
              {
                submission_data: {
                  referralCode,
                  email,
                  sweepstakesId,
                  source: 'thank_you_page',
                  timestamp: new Date().toISOString()
                },
                referral_code: referralCode
              }
            ])
            .select()
            .single();

          if (submissionError) throw submissionError;

          // Generate sharing URL with new referral code
          const uniqueId = submissionData?.id || '';
          const shareUrl = `${window.location.origin}?ref=${uniqueId}&sweepstakes_id=${sweepstakesId}`;
          setReferralUrl(shareUrl);

        } catch (err) {
          console.error('Error processing submission:', err);
          toast({
            title: "Error",
            description: "There was an error processing your submission.",
            variant: "destructive",
          });
        }
      }
    };

    initializePage();
  }, [location.search, toast]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setIsLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    let url = '';
    const text = "Join this amazing giveaway!";
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralUrl)}`;
        break;
      case 'email':
        const subject = "Check out this giveaway!";
        const body = `Hey! I thought you might be interested in this: ${referralUrl}`;
        url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-16 pb-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thanks for Entering!</h1>
            <p className="text-lg text-gray-600 mb-2">You currently have {entryCount} entries in the sweepstakes!</p>
            <p className="text-lg text-gray-600 mb-6">Want to increase your chances of winning? Share with friends to earn extra entries!</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Unique Link</h2>
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3 mb-6">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-grow bg-transparent border-none text-sm text-gray-600 focus:outline-none"
              />
              <Button
                onClick={handleCopyLink}
                variant="secondary"
                size="sm"
                className="shrink-0"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {isLinkCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="w-full"
              >
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare('twitter')}
                variant="outline"
                className="w-full"
              >
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShare('linkedin')}
                variant="outline"
                className="w-full"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </Button>
              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                className="w-full text-green-600 hover:text-green-700"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare('email')}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Want Another Entry?</h2>
            <p className="text-blue-700 mb-4">Sign up for Comprendi Reading Lessons and get an extra entry!</p>
            <Button 
              onClick={() => window.open('https://example.com/comprendi-signup', '_blank')}
              className="w-full md:w-auto"
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
