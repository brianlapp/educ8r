
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageSquare, Facebook, Linkedin, Link2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isShareExpanded, setIsShareExpanded] = useState(false);
  const shareUrl = "https://example.com/partner-page"; // Placeholder URL

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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

  const shareOnSocial = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
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
            <div className="w-16 h-16 mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-full h-full text-pink-500" fill="currentColor">
                <path d="M19.619 21.011c1.105-.299 2.067-.797 2.886-1.494a.75.75 0 10-.91-1.194c-.693.59-1.5 1.008-2.42 1.259a.75.75 0 00.444 1.429zM3.333 19.027C2.293 18.294 1.47 17.318 1 16.201a.75.75 0 00-1.392.557c.586 1.46 1.59 2.726 2.915 3.648a.75.75 0 00.81-1.264z"/>
                <path fillRule="evenodd" d="M12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Earn More Entries</h1>
            <p className="text-lg text-gray-600">
              Increase your chance of winning by sharing your unique link, getting your friends to sign up, and taking the actions below!
            </p>
          </div>

          <div className="space-y-3">
            {/* Tell Friends Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setIsShareExpanded(!isShareExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Tell some Friends!</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-500 font-medium">+3 each</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isShareExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isShareExpanded && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                    <input
                      type="text"
                      value={shareUrl}
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
              )}
            </div>

            {/* Visit Facebook */}
            <button
              onClick={() => window.open("https://facebook.com", "_blank")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="font-medium text-gray-900">Visit us on Facebook!</span>
              </div>
              <span className="text-pink-500 font-medium">+1</span>
            </button>

            {/* Open Partner Link */}
            <button
              onClick={() => window.open(shareUrl, "_blank")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Link2 className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Open this link!</span>
              </div>
              <span className="text-pink-500 font-medium">+1</span>
            </button>

            {/* Share on Facebook */}
            <button
              onClick={() => shareOnSocial("facebook")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="font-medium text-gray-900">Share on Facebook</span>
              </div>
              <span className="text-pink-500 font-medium">+1</span>
            </button>

            {/* Follow on LinkedIn */}
            <button
              onClick={() => shareOnSocial("linkedin")}
              className="w-full px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                <span className="font-medium text-gray-900">Follow us on LinkedIn</span>
              </div>
              <span className="text-pink-500 font-medium">+1</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
