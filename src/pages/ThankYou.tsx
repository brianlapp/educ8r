
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const ThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Thank You for Entering!</h1>
            <p className="text-lg text-gray-600 mb-8">Your entry has been received. Good luck!</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
