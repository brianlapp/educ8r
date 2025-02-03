import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.gleamjs.io/e.js';
    script.async = true;
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full">
          <div className="animate-fade-in">
            <div className="w-full min-h-[500px] p-4">
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