
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Tracking webhook received');
    
    // Parse request body once
    const body = await req.json();
    console.log('Webhook payload:', body);

    const { type, sweeps } = body;
    console.log('Event type:', type);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle click events
    if (type === 'click' && sweeps) {
      console.log('Processing click event');
      console.log('Sweeps param:', sweeps);

      // Call Everflow API to record click
      const EVERFLOW_API_KEY = Deno.env.get('EverflowAPI');
      if (!EVERFLOW_API_KEY) {
        throw new Error('Everflow API key not configured');
      }

      try {
        // Log the request we're about to make
        const clickPayload = {
          offer_id: 1, // Required by Everflow as a number
          affiliate_id: Number(sweeps), // Convert to number as required by Everflow
          sub1: 'test_click',
          transaction_id: `test_${Date.now()}` // For tracking
        };
        console.log('Sending click to Everflow:', clickPayload);

        const everflowResponse = await fetch('https://api.eflow.team/v1/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${EVERFLOW_API_KEY}`
          },
          body: JSON.stringify(clickPayload)
        });

        const responseText = await everflowResponse.text();
        console.log('Everflow response:', responseText);

        if (!everflowResponse.ok) {
          throw new Error(`Everflow API error: ${responseText}`);
        }

        console.log('Click recorded in Everflow successfully');
      } catch (error) {
        console.error('Error recording click in Everflow:', error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Click recorded successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Handle conversion events
    if (type !== 'click') {
      const {
        affiliate_id: affiliateId,
        click_id: trackingId,
        status,
        email: referredEmail
      } = body;

      if (!affiliateId || !trackingId || !status || !referredEmail) {
        throw new Error('Missing required fields in tracking webhook payload');
      }

      console.log('Processing conversion event:', {
        affiliateId,
        trackingId,
        status,
        referredEmail
      });

      // Only process approved conversions
      if (status === 'approved') {
        console.log('Processing approved conversion');

        // First record conversion in Everflow
        const EVERFLOW_API_KEY = Deno.env.get('EverflowAPI');
        if (!EVERFLOW_API_KEY) {
          throw new Error('Everflow API key not configured');
        }

        try {
          // Log the request we're about to make
          const conversionPayload = {
            offer_id: 1, // Required by Everflow as a number
            affiliate_id: Number(affiliateId), // Convert to number as required by Everflow
            transaction_id: trackingId,
            amount: 0
          };
          console.log('Sending conversion to Everflow:', conversionPayload);

          const everflowResponse = await fetch('https://api.eflow.team/v1/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${EVERFLOW_API_KEY}`
            },
            body: JSON.stringify(conversionPayload)
          });

          const responseText = await everflowResponse.text();
          console.log('Everflow response:', responseText);

          if (!everflowResponse.ok) {
            throw new Error(`Everflow API error: ${responseText}`);
          }

          console.log('Conversion recorded in Everflow successfully');
        } catch (error) {
          console.error('Error recording conversion in Everflow:', error);
          throw error;
        }

        // Now increment the entry count for the referrer
        const { error: entryError } = await supabaseClient.rpc(
          'increment_referral_count',
          { p_referral_id: affiliateId }
        );

        if (entryError) {
          console.error('Error incrementing referral count:', entryError);
          throw entryError;
        }

        // Find the original entry that made this referral to sync with Beehiiv
        const { data: referrerEntry, error: findError } = await supabaseClient
          .from('sweepstakes_entries')
          .select('id, beehiiv_subscriber_id, entry_count')
          .eq('affiliate_id', affiliateId)
          .maybeSingle();

        if (findError) {
          console.error('Error finding referrer entry:', findError);
          throw findError;
        }

        if (referrerEntry?.beehiiv_subscriber_id) {
          const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
          if (!BEEHIIV_API_KEY) {
            console.error('BEEHIIV_API_KEY not set');
            throw new Error('BEEHIIV_API_KEY not configured');
          }

          try {
            // Update Beehiiv subscriber custom fields with the current entry count
            const beehiivResponse = await fetch(
              `https://api.beehiiv.com/v2/subscribers/${referrerEntry.beehiiv_subscriber_id}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
                },
                body: JSON.stringify({
                  custom_fields: {
                    'sweeps-entry': referrerEntry.entry_count
                  }
                })
              }
            );

            if (!beehiivResponse.ok) {
              const errorData = await beehiivResponse.text();
              console.error('Beehiiv API error:', errorData);
              throw new Error(`Failed to update Beehiiv subscriber: ${errorData}`);
            }

            console.log('Successfully updated Beehiiv custom field with entry count');

          } catch (beehiivError) {
            console.error('Error syncing with Beehiiv:', beehiivError);
            // Don't throw here - we still want to count the conversion
          }
        }

        console.log('Successfully processed conversion');
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in tracking-webhook:', error);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
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
