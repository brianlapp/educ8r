
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
    const { email, first_name, last_name } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Generating referral URL for:', email);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the entry for this email
    const { data: entry, error: getError } = await supabaseClient
      .from('sweepstakes_entries')
      .select('id, pap_affiliate_id')
      .eq('email', email)
      .single();

    if (getError) {
      console.error('Error getting entry:', getError);
      throw getError;
    }

    // Generate the new referral URL format
    const referralUrl = `https://dmlearninglab.com/homesc/?utm_source=sweeps${entry.id}`;

    // Update the entry with the referral URL
    const { error: updateError } = await supabaseClient
      .from('sweepstakes_entries')
      .update({ 
        referral_url: referralUrl
      })
      .eq('id', entry.id);

    if (updateError) {
      console.error('Error updating entry:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
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
