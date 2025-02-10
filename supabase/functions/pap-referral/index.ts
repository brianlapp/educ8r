
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const referrerEmail = url.searchParams.get('email');
    const papReferralId = url.searchParams.get('referral_id');
    const sweepstakesId = url.searchParams.get('sweepstakes_id');

    console.log('PAP Referral request received:', {
      referrerEmail,
      papReferralId,
      sweepstakesId
    });

    if (!referrerEmail || !papReferralId || !sweepstakesId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the referrer's entry count and referral tracking
    const { data, error } = await supabaseClient
      .from('sweepstakes_entries')
      .update({
        entry_count: supabaseClient.raw('entry_count + 1'),
        referral_count: supabaseClient.raw('referral_count + 1'),
        pap_referral_id: papReferralId
      })
      .eq('email', referrerEmail)
      .eq('sweepstakes_id', sweepstakesId)
      .select()
      .single();

    if (error) {
      console.error('Error updating referral entry:', error);
      throw error;
    }

    console.log('Successfully updated referral entry:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in pap-referral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
