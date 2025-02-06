
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Received webhook data:', JSON.stringify(body, null, 2))

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the submission in the database
    console.log('Storing submission in database...')
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
      console.error('Error storing submission:', submissionError)
      throw submissionError
    }

    console.log('Submission stored successfully:', submissionData)

    // Send data to Beehiiv
    const beehiivApiKey = Deno.env.get('BEEHIIV_API_KEY')
    if (!beehiivApiKey) {
      throw new Error('Beehiiv API key not configured')
    }

    console.log('Sending data to Beehiiv...')
    const beehiivResponse = await fetch('https://api.beehiiv.com/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${beehiivApiKey}`,
      },
      body: JSON.stringify({
        email: body.email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'sweepwidget',
        utm_campaign: 'giveaway',
        referral_code: body.referral_code || null,
        custom_fields: {
          first_name: body.first_name,
          last_name: body.last_name,
        }
      }),
    })

    if (!beehiivResponse.ok) {
      const beehiivError = await beehiivResponse.text()
      console.error('Beehiiv response not OK:', beehiivError)
      throw new Error(`Failed to send to Beehiiv: ${beehiivError}`)
    }

    const beehiivData = await beehiivResponse.json()
    console.log('Successfully sent to Beehiiv:', beehiivData)

    // Update the submission with Beehiiv ID
    const { error: updateError } = await supabaseClient
      .from('form_submissions')
      .update({ 
        beehiiv_id: beehiivData.id,
        processed: true 
      })
      .eq('id', submissionData.id)

    if (updateError) {
      console.error('Error updating submission with Beehiiv ID:', updateError)
      throw updateError
    }

    // Get the Zapier webhook URL from the database
    console.log('Fetching Zapier webhook URL...')
    const { data: webhookConfig, error: webhookError } = await supabaseClient
      .from('webhook_configs')
      .select('zapier_webhook_url')
      .limit(1)
      .single()

    if (webhookError) {
      console.error('Error fetching webhook URL:', webhookError)
      throw webhookError
    }

    if (!webhookConfig?.zapier_webhook_url) {
      throw new Error('No Zapier webhook URL configured')
    }

    console.log('Forwarding data to Zapier...')
    // Forward the data to Zapier
    const zapierResponse = await fetch(webhookConfig.zapier_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!zapierResponse.ok) {
      console.error('Zapier response not OK:', zapierResponse.statusText)
      throw new Error(`Failed to forward to Zapier: ${zapierResponse.statusText}`)
    }

    console.log('Successfully forwarded to Zapier')

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
