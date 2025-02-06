
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Facebook, Linkedin, Link2, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ThankYou = () => {
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
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
      
      <main className="flex-grow w-full pt-20 pb-12 bg-gray-50">
        <div className="w-full max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold mb-4">Thank You for Entering!</h1>
            <p className="text-lg text-gray-600 mb-8">Your entry has been received. Good luck!</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center mb-6">
              <img
                src="/lovable-uploads/16b06a6c-2c6c-4b39-a74f-e02bacf2d8d9.png"
                alt="Megaphone Icon"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">Earn More Entries</h2>
              <p className="text-gray-600">
                Increase your chance of winning by sharing with friends and visiting our partner!
              </p>
            </div>

            <div className="space-y-4">
              {/* Share Link Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    {isLinkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnSocial("facebook")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1664d9] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  Share on Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#085196] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  Share on LinkedIn
                </button>
              </div>

              {/* Visit Partner Link */}
              <div className="mt-6 text-center">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Visit Our Partner
                </a>
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
