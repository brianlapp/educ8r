
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Admin = () => {
  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['sweepstakes-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow w-full pt-28 pb-12 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4">Sweepstakes Entries</h2>
                
                {isLoading && (
                  <p className="text-gray-600">Loading entries...</p>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load sweepstakes entries. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}

                {entries && entries.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Entries</TableHead>
                        <TableHead className="text-right">Referrals</TableHead>
                        <TableHead>Affiliate ID</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.email}</TableCell>
                          <TableCell>{`${entry.first_name} ${entry.last_name}`}</TableCell>
                          <TableCell className="text-right">{entry.entry_count}</TableCell>
                          <TableCell className="text-right">{entry.referral_count}</TableCell>
                          <TableCell>{entry.affiliate_id || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {entries && entries.length === 0 && (
                  <p className="text-gray-600">No entries found.</p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Need More Advanced Queries?</AlertTitle>
                <AlertDescription>
                  For more advanced data analysis, you can use the Supabase Dashboard directly.
                  This includes custom SQL queries, filtering, and detailed analytics.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;

