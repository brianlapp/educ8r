
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
    
    // Parse the POST data from PAP
    const data = await req.json();
    console.log('Webhook payload:', data);

    // Extract relevant information from PAP postback
    const {
      refid: papReferrerId,  // PAP affiliate ID of referrer
      clickid: papTrackingId, // PAP click tracking ID
      commission_status: status,
      email: referredEmail
    } = data;

    if (!papReferrerId || !papTrackingId || !status || !referredEmail) {
      throw new Error('Missing required fields in PAP webhook payload');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update referral status if commission is approved
    if (status === 'approved') {
      console.log('Processing approved commission');

      // First, update the referral record
      const { error: referralError } = await supabaseClient
        .from('referrals')
        .update({ converted: true })
        .eq('pap_tracking_id', papTrackingId);

      if (referralError) {
        console.error('Error updating referral:', referralError);
        throw referralError;
      }

      // Then, increment referral count for the referrer's entry
      const { error: entryError } = await supabaseClient.rpc(
        'increment_referral_count',
        { p_pap_affiliate_id: papReferrerId }
      );

      if (entryError) {
        console.error('Error incrementing referral count:', entryError);
        throw entryError;
      }

      console.log('Successfully processed PAP conversion');
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
