
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

    // First, check if subscriber already exists and get their current entry count
    const subscriberUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/email/${encodeURIComponent(email)}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
    };

    console.log('Fetching existing subscriber data...');
    const subscriberResponse = await fetch(subscriberUrl, {
      method: 'GET',
      headers,
    });

    let currentEntryCount = 0;
    let existingSubscriberId = null;
    
    if (subscriberResponse.ok) {
      const subscriberData = await subscriberResponse.json();
      console.log('Existing subscriber data:', JSON.stringify(subscriberData, null, 2));

      if (subscriberData.data?.id) {
        existingSubscriberId = subscriberData.data.id;
      }

      // Try to get the current entry count from custom fields
      if (subscriberData.data?.custom_fields) {
        const entriesField = subscriberData.data.custom_fields.find(
          (field: { id: string }) => field.id === 'sweepstakes_entries'
        );
        if (entriesField) {
          currentEntryCount = parseInt(entriesField.value, 10) || 0;
          console.log('Current entry count:', currentEntryCount);
        }
      }
    } else {
      console.log('No existing subscriber found or error fetching data:', {
        status: subscriberResponse.status,
        statusText: subscriberResponse.statusText,
        body: await subscriberResponse.text()
      });
    }

    // Increment the entry count
    const newEntryCount = currentEntryCount + 1;
    console.log('New entry count:', newEntryCount);

    // Format the custom fields according to Beehiiv API requirements
    const customFields = [
      {
        id: "sweepstakes_entries",
        value: String(newEntryCount)
      }
    ];

    // Add debug logging for custom fields
    console.log('Custom fields being sent to Beehiiv:', JSON.stringify(customFields, null, 2));

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

    console.log('Full Beehiiv subscription data:', JSON.stringify(subscriberData, null, 2));

    const beehiivUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;
    
    const response = await fetch(beehiivUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriberData),
    });

    // Enhanced response logging
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('Beehiiv API Response Headers:', responseHeaders);
    console.log('Beehiiv API Response Status:', response.status);
    console.log('Beehiiv API Response Status Text:', response.statusText);

    const responseData = await response.json();
    console.log('Beehiiv API Response Body:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('Beehiiv API error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseData
      });
      throw new Error(`Beehiiv API error: ${JSON.stringify(responseData)}`);
    }

    // Get the subscriber ID from the response or use existing one
    const subscriberId = responseData.data?.id || existingSubscriberId;

    if (subscriberId) {
      // Make a separate API call to update custom fields
      const customFieldsUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/custom_fields`;
      console.log('Making separate custom fields update call to:', customFieldsUrl);
      
      const customFieldsResponse = await fetch(customFieldsUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ custom_fields: customFields }),
      });

      // Log custom fields update response
      const customFieldsResponseHeaders = Object.fromEntries(customFieldsResponse.headers.entries());
      const customFieldsResponseData = await customFieldsResponse.json();
      
      console.log('Custom Fields Update Response:', {
        status: customFieldsResponse.status,
        statusText: customFieldsResponse.statusText,
        headers: customFieldsResponseHeaders,
        body: customFieldsResponseData
      });

      if (!customFieldsResponse.ok) {
        console.warn('Warning: Failed to update custom fields:', customFieldsResponseData);
      }
    }

    // Update the sweepstakes entry with the Beehiiv subscriber ID
    if (subscriberId) {
      console.log('Updating entry with Beehiiv subscriber ID...');
      const { error: updateError } = await supabaseClient
        .from('sweepstakes_entries')
        .update({ beehiiv_subscriber_id: subscriberId })
        .eq('id', entryData.id);

      if (updateError) {
        console.warn('Warning: Failed to update Beehiiv subscriber ID:', updateError);
      }
    }

    // Add tags explicitly
    if (subscriberId) {
      const tagsUrl = `${beehiivUrl}/${subscriberId}/tags`;
      console.log('Adding tags to subscriber...');
      
      const tagsResponse = await fetch(tagsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags }),
      });

      // Log tags update response
      const tagsResponseData = await tagsResponse.json();
      console.log('Tags Update Response:', {
        status: tagsResponse.status,
        statusText: tagsResponse.statusText,
        body: tagsResponseData
      });

      if (!tagsResponse.ok) {
        console.warn('Warning: Failed to add tags:', tagsResponseData);
      }
    }

    return new Response(JSON.stringify({
      beehiiv: responseData,
      entry: entryData,
      previous_entry_count: currentEntryCount,
      new_entry_count: newEntryCount
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
