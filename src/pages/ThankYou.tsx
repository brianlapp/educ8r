
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageSquare, Facebook, Mail, Twitter, Link2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isShareExpanded, setIsShareExpanded] = useState(false);
  const referrerUrl = "https://example.com/partner-page"; // Placeholder URL
  const emailTemplate = `Hey! I thought you might be interested in checking this out: ${referrerUrl}. It's pretty cool!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referrerUrl);
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

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      toast({
        title: "Email template copied!",
        description: "The email template has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the text manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referrerUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referrerUrl)}`;
        break;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-16 pb-12 bg-gray-50">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Earn More Entries</h1>
            <p className="text-lg text-gray-600">
              Increase your chance of winning by sharing your unique link, getting your friends to sign up, and taking the actions below!
            </p>
          </div>

          <div className="space-y-3">
            {/* Share on Facebook */}
            <button
              onClick={() => shareOnSocial("facebook")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="font-medium text-gray-900">Share this on Facebook</span>
              </div>
              <span className="text-pink-500 font-medium">+3</span>
            </button>

            {/* Share on Twitter */}
            <button
              onClick={() => shareOnSocial("twitter")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                <span className="font-medium text-gray-900">Share this on Twitter</span>
              </div>
              <span className="text-pink-500 font-medium">+3</span>
            </button>

            {/* Email to a Friend Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setIsShareExpanded(!isShareExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Email to a Friend</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-500 font-medium">+3</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isShareExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isShareExpanded && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Copy this template and send it to your friends:</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">{emailTemplate}</p>
                    </div>
                    <Button
                      onClick={handleCopyEmail}
                      size="sm"
                      className="w-full"
                    >
                      Copy Email Template
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Share Link */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4">
                <div className="flex items-center gap-4 mb-3">
                  <Link2 className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Share via Link</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                  <input
                    type="text"
                    value={referrerUrl}
                    readOnly
                    className="flex-grow bg-transparent border-none text-sm text-gray-600 focus:outline-none"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className="shrink-0"
                  >
                    {isLinkCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
