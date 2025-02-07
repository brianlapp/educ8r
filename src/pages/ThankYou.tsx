
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const referrerUrl = "https://example.com/partner-page"; // Placeholder URL
  const emailTemplate = `Subject: Check out this amazing opportunity!\n\nHey! I thought you might be interested in checking this out: ${referrerUrl}. It's pretty cool!`;

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
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Share This Page</h1>

          <div className="space-y-6">
            {/* Social Sharing Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => shareOnSocial("facebook")}
                className="w-full bg-[#1877F2] text-white py-4 rounded-lg font-semibold text-center hover:bg-[#1877F2]/90 transition-colors"
              >
                SHARE
              </button>
              <button
                onClick={() => shareOnSocial("twitter")}
                className="w-full bg-[#1DA1F2] text-white py-4 rounded-lg font-semibold text-center hover:bg-[#1DA1F2]/90 transition-colors"
              >
                TWEET
              </button>
            </div>

            {/* Direct Link Section */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Direct Link</h2>
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3">
                <input
                  type="text"
                  value={referrerUrl}
                  readOnly
                  className="flex-grow bg-transparent border-none text-sm text-gray-600 focus:outline-none"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                >
                  {isLinkCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email A Friend</h2>
              <div className="bg-gray-100 rounded-lg p-4 space-y-4">
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {emailTemplate}
                </div>
                <Button
                  onClick={handleCopyEmail}
                  variant="secondary"
                  className="w-full"
                >
                  Copy Email Template
                </Button>
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
