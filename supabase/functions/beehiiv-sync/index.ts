
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
const BEEHIIV_PUBLICATION_ID = 'pub_4b47c3db-7b59-4c82-a18b-16cf10fc2d23';

serve(async (req) => {
  // Add request logging
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting beehiiv-sync function execution');
    
    // Check and log API key status (partial key for security)
    const apiKeyStatus = BEEHIIV_API_KEY ? 
      `present (starts with: ${BEEHIIV_API_KEY.substring(0, 4)}...)` : 
      'not set';
    console.log('BEEHIIV_API_KEY status:', apiKeyStatus);

    if (!BEEHIIV_API_KEY) {
      console.error('BEEHIIV_API_KEY environment variable is not set');
      throw new Error('BEEHIIV_API_KEY is not set');
    }

    const { first_name, last_name, email } = await req.json();
    console.log('Received data:', { first_name, last_name, email });

    if (!email) {
      console.error('Email is required but was not provided');
      throw new Error('Email is required');
    }

    // Format the custom fields as an array of objects with id and value
    const customFields = [
      { id: 'first_name', value: first_name || '' },
      { id: 'last_name', value: last_name || '' }
    ];

    // Define base tags
    const tags = ['sweeps', 'Comprendi-sweeps'];

    // First API call - Create/Update subscription
    const subscriberData = {
      email,
      publication_id: BEEHIIV_PUBLICATION_ID,
      double_opt_in: false,
      utm_source: 'sweepstakes',
      utm_medium: 'Comprendi-sweeps',
      utm_campaign: 'Comprendi-sweeps',
      send_welcome_email: true,
      reactivate_existing: true,
      custom_fields: customFields,
      tags
    };

    console.log('Sending initial subscription request to Beehiiv with body:', JSON.stringify(subscriberData));

    const beehiivUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;
    console.log('Beehiiv API URL:', beehiivUrl);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
    };
    console.log('Request headers (excluding Authorization):', {
      'Content-Type': headers['Content-Type']
    });

    const response = await fetch(beehiivUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();
    console.log('Beehiiv API response status:', response.status);
    console.log('Beehiiv API response body:', JSON.stringify(responseData));

    if (!response.ok) {
      console.error('Beehiiv API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseData
      });
      throw new Error(`Beehiiv API error: ${JSON.stringify(responseData)}`);
    }

    // Second API call - Explicit tag addition
    if (responseData.data && responseData.data.id) {
      const tagsUrl = `${beehiivUrl}/${responseData.data.id}/tags`;
      console.log('Sending explicit tags request to:', tagsUrl);
      
      const tagsResponse = await fetch(tagsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags }),
      });

      const tagsResponseData = await tagsResponse.json();
      console.log('Tags API response status:', tagsResponse.status);
      console.log('Tags API response body:', JSON.stringify(tagsResponseData));

      if (!tagsResponse.ok) {
        console.warn('Warning: Tags API call failed:', {
          status: tagsResponse.status,
          statusText: tagsResponse.statusText,
          body: tagsResponseData
        });
        // We don't throw here as the main subscription succeeded
      }
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in beehiiv-sync:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
