import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    console.log('Received webhook data:', body)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the submission in the database
    const { data: submissionData, error: submissionError } = await supabaseClient
      .from('form_submissions')
      .insert([
        {
          submission_data: body,
          processed: false
        }
      ])
      .select()
      .single()

    if (submissionError) {
      throw submissionError
    }

    // Get the Zapier webhook URL from the database
    const { data: webhookConfig, error: webhookError } = await supabaseClient
      .from('webhook_configs')
      .select('zapier_webhook_url')
      .limit(1)
      .single()

    if (webhookError) {
      throw webhookError
    }

    if (!webhookConfig?.zapier_webhook_url) {
      throw new Error('No Zapier webhook URL configured')
    }

    // Forward the data to Zapier
    const zapierResponse = await fetch(webhookConfig.zapier_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!zapierResponse.ok) {
      throw new Error(`Failed to forward to Zapier: ${zapierResponse.statusText}`)
    }

    // Update the submission as processed
    const { error: updateError } = await supabaseClient
      .from('form_submissions')
      .update({ processed: true })
      .eq('id', submissionData.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})