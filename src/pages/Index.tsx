
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
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center lg:items-start relative">
              {/* Image section - aligned right on desktop */}
              <div className="w-full lg:w-1/3 flex lg:justify-end lg:pr-0">
                <img 
                  src="/lovable-uploads/eb280041-c9b0-4439-87b7-33752d951703.png"
                  alt="Giveaway prizes"
                  className="max-w-[300px] lg:max-w-full w-full object-contain rounded-lg"
                />
              </div>
              
              {/* Widget section - aligned left and overlapping */}
              <div className="w-full lg:w-2/3 lg:-ml-5 z-10">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
