
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

    // First, let's list existing custom fields to avoid duplicates
    console.log('Fetching existing custom fields...');
    const listResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/custom_fields`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        },
      }
    );

    const existingFields = await listResponse.json();
    console.log('Existing custom fields:', existingFields);

    // Check if the field already exists
    const existingField = existingFields.data?.find(
      (field: any) => field.name === "Sweepstakes Entry"
    );

    if (existingField) {
      console.log('Custom field already exists:', existingField);
      return new Response(
        JSON.stringify({ success: true, data: existingField, existing: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // If the field doesn't exist, create it - using 'string' type instead of 'number'
    console.log('Creating new custom field...');
    const createResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/custom_fields`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          name: "Sweepstakes Entry",
          kind: "string", // Changed from 'number' to 'string'
          display: "Sweepstakes Entry"
        }),
      }
    );

    const createData = await createResponse.json();
    console.log('Custom field creation response:', createData);

    if (!createResponse.ok) {
      throw new Error(`Failed to create custom field: ${JSON.stringify(createData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: createData, created: true }),
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
