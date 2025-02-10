
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LegalDocument = () => {
  const { type } = useParams();
  const [document, setDocument] = useState<{title: string, content: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('title, content')
        .eq('type', type)
        .maybeSingle();

      if (error) {
        console.error('Error fetching legal document:', error);
      } else if (data) {
        setDocument(data);
      }
      setIsLoading(false);
    };

    fetchDocument();
  }, [type]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!document) {
    return <div className="min-h-screen flex items-center justify-center">Document not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{document.title}</h1>
        <div className="prose max-w-none">
          {document.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
