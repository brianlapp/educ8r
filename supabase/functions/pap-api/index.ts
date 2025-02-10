
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAP_API_URL = 'https://dmlearninglab.com/pap/api.php';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, last_name } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log('PAP API request received:', { email, first_name, last_name });

    // First, try to get existing affiliate ID
    const getAffiliateResponse = await fetch(`${PAP_API_URL}?action=getAffiliateId&email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });

    let papAffiliateId = null;
    
    // If the affiliate doesn't exist (404) or there's some other error, we'll create a new one
    if (!getAffiliateResponse.ok) {
      console.log('No existing affiliate found or error occurred, creating new one');
    } else {
      try {
        const affiliateData = await getAffiliateResponse.json();
        papAffiliateId = affiliateData.affiliate_id;
      } catch (e) {
        console.log('Error parsing affiliate data:', e);
      }
    }

    // If no existing affiliate was found or there was an error, create a new one
    if (!papAffiliateId) {
      console.log('Creating new affiliate');
      
      const createAffiliateResponse = await fetch(PAP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createAffiliate',
          email,
          name: `${first_name} ${last_name}`.trim(),
        }),
      });

      if (!createAffiliateResponse.ok) {
        throw new Error(`Failed to create affiliate: ${createAffiliateResponse.statusText}`);
      }

      const newAffiliateData = await createAffiliateResponse.json();
      papAffiliateId = newAffiliateData.affiliate_id;
    }

    if (!papAffiliateId) {
      throw new Error('Failed to get or create PAP affiliate ID');
    }

    // Generate referral URL
    const referralUrl = `https://dmlearninglab.com/homesc/?pap_ref_id=${papAffiliateId}`;

    // Update Supabase records
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('sweepstakes_entries')
      .update({
        pap_affiliate_id: papAffiliateId
      })
      .eq('email', email);

    if (updateError) {
      console.error('Error updating sweepstakes entry:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        papAffiliateId,
        referralUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in pap-api:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
