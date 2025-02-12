
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

    // Check content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ 
          error: 'Content-Type must be application/json',
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { first_name, last_name, email, sweepstakes_id } = requestBody;
    console.log('Parsed request data:', { first_name, last_name, email, sweepstakes_id });

    if (!email) {
      console.error('Email is required but was not provided');
      throw new Error('Email is required');
    }

    if (!sweepstakes_id) {
      console.error('Sweepstakes ID is required but was not provided');
      throw new Error('Sweepstakes ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First check if entry already exists
    const { data: existingEntry, error: checkError } = await supabaseClient
      .from('sweepstakes_entries')
      .select('id, entry_count, email')
      .eq('email', email)
      .eq('sweepstakes_id', sweepstakes_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing entry:', checkError);
      throw checkError;
    }

    if (existingEntry) {
      console.log('Found existing entry:', existingEntry);
      return new Response(
        JSON.stringify({
          error: 'duplicate_entry',
          message: 'You have already entered this sweepstakes',
          entry: existingEntry
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Create sweepstakes entry
    console.log('Creating sweepstakes entry...');
    const { data: entryData, error: entryError } = await supabaseClient
      .from('sweepstakes_entries')
      .insert({
        email,
        first_name,
        last_name,
        sweepstakes_id,
        terms_accepted: true,
        entry_count: 1
      })
      .select()
      .single();

    if (entryError) {
      console.error('Error creating sweepstakes entry:', entryError);
      throw entryError;
    }

    console.log('Sweepstakes entry created:', entryData);

    // Subscribe to Beehiiv
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
    };

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
      tags
    };

    console.log('Beehiiv subscription data:', subscriberData);

    const beehiivUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;
    
    const response = await fetch(beehiivUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();
    console.log('Beehiiv API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseData
    });

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${JSON.stringify(responseData)}`);
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
    
    // Determine if it's a duplicate entry error
    if (error.message && error.message.includes('unique_email_per_sweepstakes')) {
      return new Response(
        JSON.stringify({
          error: 'duplicate_entry',
          message: 'You have already entered this sweepstakes'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: {
          name: error.name,
          stack: error.stack
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
