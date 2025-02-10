
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
const BEEHIIV_PUBLICATION_ID = 'pub_0d2f6c47-47c7-40b3-8537-6978ed770251';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BEEHIIV_API_KEY) {
      throw new Error('BEEHIIV_API_KEY is not set');
    }

    const { first_name, last_name, email } = await req.json();
    console.log('Received data:', { first_name, last_name, email });

    if (!email) {
      throw new Error('Email is required');
    }

    const requestBody = {
      email: email,
      publication_id: BEEHIIV_PUBLICATION_ID,
      double_opt_in: false,
      utm_source: 'website',
      send_welcome_email: true,
      reactivate_existing: true,
      custom_fields: {
        first_name: first_name || '',
        last_name: last_name || ''
      }
    };

    console.log('Sending request to Beehiiv:', requestBody);

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log('Beehiiv API response status:', response.status);
    console.log('Beehiiv API response:', responseData);

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in beehiiv-sync:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
