
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

      // Extract affiliate ID from sweeps parameter
      const papAffiliateId = sweeps;
      if (!papAffiliateId) {
        throw new Error('Invalid sweeps parameter format');
      }

      console.log('PAP Affiliate ID:', papAffiliateId);

      // First, find the entry with this PAP affiliate ID
      const { data: entry, error: findError } = await supabaseClient
        .from('sweepstakes_entries')
        .select('id, entry_count, sweepstakes_id, email')
        .eq('pap_affiliate_id', papAffiliateId)
        .maybeSingle();

      if (findError) {
        console.error('Error finding entry:', findError);
        throw findError;
      }

      if (!entry) {
        console.error('No entry found for PAP affiliate ID:', papAffiliateId);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No entry found with the provided affiliate ID' 
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
        { p_pap_affiliate_id: papAffiliateId }
      );

      if (entryError) {
        console.error('Error incrementing referral count:', entryError);
        throw entryError;
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
        refid: papReferrerId,
        clickid: papTrackingId,
        commission_status: status,
        email: referredEmail
      } = body;

      if (!papReferrerId || !papTrackingId || !status || !referredEmail) {
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
          .select('id, beehiiv_subscriber_id')
          .eq('pap_affiliate_id', papReferrerId)
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
            // Update Beehiiv subscriber custom fields for the extra entry
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
                    sweeps_entry: 'extra_entry'
                  }
                })
              }
            );

            if (!beehiivResponse.ok) {
              const errorData = await beehiivResponse.text();
              console.error('Beehiiv API error:', errorData);
              throw new Error(`Failed to update Beehiiv subscriber: ${errorData}`);
            }

            // Mark the entry as synced in our database
            const { error: syncError } = await supabaseClient
              .from('sweepstakes_entries')
              .update({
                beehiiv_entry_synced: true,
                beehiiv_entry_synced_at: new Date().toISOString()
              })
              .eq('id', referrerEntry.id);

            if (syncError) {
              console.error('Error marking entry as synced:', syncError);
              throw syncError;
            }
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
