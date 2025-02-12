
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
const BEEHIIV_PUBLICATION_ID = 'pub_4b47c3db-7b59-4c82-a18b-16cf10fc2d23';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting beehiiv-setup function execution');

    if (!BEEHIIV_API_KEY) {
      throw new Error('BEEHIIV_API_KEY is not set');
    }

    const createCustomField = async () => {
      const customFieldData = {
        name: "Sweepstakes Entry",
        kind: "number",
        display: "Sweepstakes Entry"
      };

      console.log('Creating custom field with data:', customFieldData);

      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/custom_fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify(customFieldData),
        }
      );

      const data = await response.json();
      console.log('Custom field creation response:', data);

      if (!response.ok) {
        throw new Error(`Failed to create custom field: ${JSON.stringify(data)}`);
      }

      return data;
    };

    const result = await createCustomField();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in beehiiv-setup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
