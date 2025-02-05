import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
            
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Premium Features Not Available</AlertTitle>
                <AlertDescription>
                  Some features like webhooks and custom redirects require a premium Gleam subscription. 
                  These features are currently not available in our plan tier. Users will need to complete 
                  the entry form directly through Gleam&apos;s interface.
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Available Features</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Basic entry collection through Gleam widget</li>
                  <li>Standard Gleam entry validation</li>
                  <li>Entry tracking within Gleam dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;