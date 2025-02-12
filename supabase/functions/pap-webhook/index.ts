
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
    console.log('PAP webhook received');
    
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

      // Extract referral ID from sweeps parameter
      const referralId = sweeps;
      if (!referralId) {
        throw new Error('Invalid sweeps parameter format');
      }

      console.log('Referral ID:', referralId);

      // Then try to find our specific entry
      const { data: entry, error: findError } = await supabaseClient
        .from('sweepstakes_entries')
        .select('id, entry_count, sweepstakes_id, email, pap_referral_id, beehiiv_subscriber_id')
        .eq('pap_referral_id', referralId)
        .maybeSingle();

      if (findError) {
        console.error('Error finding entry:', findError);
        throw findError;
      }

      console.log('Found entry:', entry);

      if (!entry) {
        console.error('No entry found for referral ID:', referralId);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No entry found with the provided referral ID' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        );
      }

      // Then, increment referral count for the referrer's entry
      const { error: entryError } = await supabaseClient.rpc(
        'increment_referral_count',
        { p_referral_id: referralId }
      );

      if (entryError) {
        console.error('Error incrementing referral count:', entryError);
        throw entryError;
      }

      // After incrementing, get the updated entry count
      const { data: updatedEntry, error: updateError } = await supabaseClient
        .from('sweepstakes_entries')
        .select('entry_count, beehiiv_subscriber_id')
        .eq('id', entry.id)
        .single();

      if (updateError) {
        console.error('Error getting updated entry:', updateError);
        throw updateError;
      }

      console.log('Updated entry data:', updatedEntry);

      if (updatedEntry?.beehiiv_subscriber_id) {
        const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
        if (!BEEHIIV_API_KEY) {
          console.error('BEEHIIV_API_KEY not set');
          throw new Error('BEEHIIV_API_KEY not configured');
        }

        try {
          const updatePayload = {
            custom_fields: {
              'sweeps-entry': Number(updatedEntry.entry_count)
            }
          };
          
          console.log('Sending Beehiiv update with payload:', updatePayload);
          console.log('Subscriber ID:', updatedEntry.beehiiv_subscriber_id);
          
          // Update Beehiiv subscriber custom fields with the entry count
          const beehiivResponse = await fetch(
            `https://api.beehiiv.com/v2/subscribers/${updatedEntry.beehiiv_subscriber_id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
              },
              body: JSON.stringify(updatePayload)
            }
          );

          const responseText = await beehiivResponse.text();
          console.log('Beehiiv API response status:', beehiivResponse.status);
          console.log('Beehiiv API response body:', responseText);

          if (!beehiivResponse.ok) {
            throw new Error(`Failed to update Beehiiv subscriber: ${responseText}`);
          }

          console.log('Successfully updated Beehiiv custom field');
        } catch (beehiivError) {
          console.error('Error syncing with Beehiiv:', beehiivError);
          console.error('Full error details:', {
            name: beehiivError.name,
            message: beehiivError.message,
            stack: beehiivError.stack,
            cause: beehiivError.cause
          });
          // Don't throw here - we still want to count the conversion
        }
      }

      console.log('Successfully processed PAP click');
      
      return new Response(
        JSON.stringify({ success: true, message: 'Click processed successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Handle commission/conversion events
    if (type !== 'click') {
      const {
        refid: referrerId,
        clickid: papTrackingId,
        commission_status: status,
        email: referredEmail
      } = body;

      if (!referrerId || !papTrackingId || !status || !referredEmail) {
        throw new Error('Missing required fields in PAP webhook payload');
      }

      // Update referral status if commission is approved
      if (status === 'approved') {
        console.log('Processing approved commission');

        // Update the referral record
        const { error: referralError } = await supabaseClient
          .from('referrals')
          .update({ converted: true })
          .eq('pap_tracking_id', papTrackingId);

        if (referralError) {
          console.error('Error updating referral:', referralError);
          throw referralError;
        }

        // Find the original entry that made this referral
        const { data: referrerEntry, error: findError } = await supabaseClient
          .from('sweepstakes_entries')
          .select('id, beehiiv_subscriber_id, entry_count')
          .eq('pap_referral_id', referrerId)
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

        console.log('Successfully processed PAP conversion');
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
    console.error('Error in pap-webhook:', error);
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
