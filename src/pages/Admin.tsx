import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
            
            <div className="space-y-6">
              <p className="text-gray-500">
                Admin settings panel is currently in development. Please check back later for updates.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;