import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Main content with padding for fixed navbar */}
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="animate-fade-in">
            {/* Placeholder for Gleam.io embed */}
            <div className="w-full min-h-[500px] bg-gray-50 rounded-lg shadow-sm">
              {/* Add your Gleam.io embed code here */}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;