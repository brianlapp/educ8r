
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
    const { first_name, last_name, email } = await req.json();
    console.log('Received data:', { first_name, last_name, email });

    // Call Beehiiv API to create subscriber
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        publication_id: BEEHIIV_PUBLICATION_ID,
        double_opt_in: false,
        utm_source: 'website',
        send_welcome_email: true,
        custom_fields: {
          first_name: first_name,
          last_name: last_name
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Beehiiv API error:', errorData);
      throw new Error(`Beehiiv API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Beehiiv API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
