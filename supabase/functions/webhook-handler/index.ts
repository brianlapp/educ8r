
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

    const PUBLICATION_ID = 'pub_4b47c3db-7b59-4c82-a18b-16cf10fc2d23'
    
    console.log('Sending data to Beehiiv...')
    const beehiivPayload = {
      email: body.email,
      publication_id: PUBLICATION_ID,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'sweepwidget',
      utm_campaign: 'giveaway',
      custom_fields: [
        { name: "first_name", value: body.firstName },
        { name: "last_name", value: body.lastName }
      ]
    }
    console.log('Beehiiv payload:', JSON.stringify(beehiivPayload, null, 2))

    const beehiivResponse = await fetch(`https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${beehiivApiKey}`,
      },
      body: JSON.stringify(beehiivPayload),
    })

    let beehiivResponseText = '';
    try {
      beehiivResponseText = await beehiivResponse.text();
      console.log('Raw Beehiiv response:', beehiivResponseText);
    } catch (e) {
      console.error('Error reading Beehiiv response:', e);
    }

    if (!beehiivResponse.ok) {
      console.error('Beehiiv response not OK:', {
        status: beehiivResponse.status,
        statusText: beehiivResponse.statusText,
        responseText: beehiivResponseText
      });
      throw new Error(`Failed to send to Beehiiv: ${beehiivResponse.status} - ${beehiivResponseText}`);
    }

    let beehiivData;
    try {
      beehiivData = JSON.parse(beehiivResponseText);
      console.log('Successfully sent to Beehiiv:', beehiivData);
    } catch (e) {
      console.error('Error parsing Beehiiv response:', e);
      throw new Error('Invalid JSON response from Beehiiv');
    }

    // Add tags in a separate API call
    console.log('Adding tags to subscription...');
    const tagsResponse = await fetch(`https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions/${beehiivData.id}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${beehiivApiKey}`,
      },
      body: JSON.stringify({
        tags: ['sweeps', 'Comprendi-sweeps']
      }),
    });

    if (!tagsResponse.ok) {
      console.error('Failed to add tags:', await tagsResponse.text());
    } else {
      console.log('Tags added successfully');
    }

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
