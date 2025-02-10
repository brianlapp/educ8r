
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
const BEEHIIV_PUBLICATION_ID = 'pub_4b47c3db-7b59-4c82-a18b-16cf10fc2d23';

serve(async (req) => {
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
    
    if (!BEEHIIV_API_KEY) {
      console.error('BEEHIIV_API_KEY environment variable is not set');
      throw new Error('BEEHIIV_API_KEY is not set');
    }

    const { first_name, last_name, email, sweepstakes_id } = await req.json();
    console.log('Received data:', { first_name, last_name, email, sweepstakes_id });

    if (!email) {
      console.error('Email is required but was not provided');
      throw new Error('Email is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create sweepstakes entry first
    console.log('Creating sweepstakes entry...');
    const { data: entryData, error: entryError } = await supabaseClient
      .from('sweepstakes_entries')
      .upsert({
        email,
        first_name,
        last_name,
        sweepstakes_id,
        terms_accepted: true,
        entry_count: 1
      }, {
        onConflict: 'unique_email_per_sweepstakes', // Updated to use the constraint name
        ignoreDuplicates: true
      })
      .select()
      .single();

    if (entryError) {
      console.error('Error creating sweepstakes entry:', entryError);
      throw entryError;
    }

    console.log('Sweepstakes entry created:', entryData);

    // Format the custom fields for Beehiiv
    const customFields = [
      { id: 'first_name', value: first_name || '' },
      { id: 'last_name', value: last_name || '' }
    ];

    // Define base tags
    const tags = ['sweeps', 'Comprendi-sweeps'];

    // Beehiiv subscription data
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

    console.log('Sending subscription request to Beehiiv with body:', JSON.stringify(subscriberData));

    const beehiivUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
    };

    const response = await fetch(beehiivUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();
    console.log('Beehiiv API response:', {
      status: response.status,
      body: responseData
    });

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${JSON.stringify(responseData)}`);
    }

    // Update the sweepstakes entry with the Beehiiv subscriber ID
    if (responseData.data && responseData.data.id) {
      console.log('Updating entry with Beehiiv subscriber ID...');
      const { error: updateError } = await supabaseClient
        .from('sweepstakes_entries')
        .update({ beehiiv_subscriber_id: responseData.data.id })
        .eq('id', entryData.id);

      if (updateError) {
        console.warn('Warning: Failed to update Beehiiv subscriber ID:', updateError);
      }
    }

    // Add tags explicitly
    if (responseData.data && responseData.data.id) {
      const tagsUrl = `${beehiivUrl}/${responseData.data.id}/tags`;
      console.log('Adding tags to subscriber...');
      
      const tagsResponse = await fetch(tagsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags }),
      });

      if (!tagsResponse.ok) {
        console.warn('Warning: Failed to add tags:', await tagsResponse.json());
      }
    }

    return new Response(JSON.stringify({
      beehiiv: responseData,
      entry: entryData
    }), {
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
