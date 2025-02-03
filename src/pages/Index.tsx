import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Create a new script element
    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    
    // Add the script to the document
    document.body.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="w-full min-h-[500px] bg-gray-50 rounded-lg shadow-sm p-4">
              <a 
                className="e-widget" 
                href="https://gleam.io/dAUCD/instant-entry" 
                rel="nofollow"
              >
                Instant Entry
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;