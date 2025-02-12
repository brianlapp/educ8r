
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
        .select('id, entry_count, sweepstakes_id')
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
