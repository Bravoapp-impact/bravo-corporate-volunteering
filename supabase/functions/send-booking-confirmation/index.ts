import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  booking_id: string;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('it-IT', options);
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { booking_id }: BookingConfirmationRequest = await req.json();

    if (!booking_id) {
      throw new Error("booking_id is required");
    }

    console.log(`Processing booking confirmation for: ${booking_id}`);

    // Fetch booking with all related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        experience_date_id,
        status,
        created_at
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, company_id")
      .eq("id", booking.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    // Get experience date details
    const { data: experienceDate, error: dateError } = await supabase
      .from("experience_dates")
      .select(`
        id,
        start_datetime,
        end_datetime,
        experience_id
      `)
      .eq("id", booking.experience_date_id)
      .single();

    if (dateError || !experienceDate) {
      throw new Error(`Experience date not found: ${dateError?.message}`);
    }

    // Get experience details
    const { data: experience, error: expError } = await supabase
      .from("experiences")
      .select("title, description, city, address, association_name, category")
      .eq("id", experienceDate.experience_id)
      .single();

    if (expError || !experience) {
      throw new Error(`Experience not found: ${expError?.message}`);
    }

    // Check email settings for the company
    const { data: emailSettings } = await supabase
      .from("email_settings")
      .select("confirmation_enabled")
      .eq("company_id", profile.company_id)
      .single();

    if (emailSettings && !emailSettings.confirmation_enabled) {
      console.log("Confirmation emails disabled for this company");
      return new Response(
        JSON.stringify({ success: true, message: "Confirmation emails disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email template for the company
    const { data: template } = await supabase
      .from("email_templates")
      .select("subject, intro_text, closing_text")
      .eq("company_id", profile.company_id)
      .eq("template_type", "booking_confirmation")
      .single();

    // Default values if no template exists
    const subject = template?.subject || `Conferma prenotazione: ${experience.title}`;
    const introText = template?.intro_text || `Ciao ${profile.first_name || ""},\n\nLa tua prenotazione è stata confermata con successo!`;
    const closingText = template?.closing_text || "Ti aspettiamo! Grazie per il tuo impegno nel volontariato.\n\nIl team Bravo!";

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma Prenotazione</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Bravo! 🎉</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Prenotazione Confermata</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="white-space: pre-line; margin-bottom: 24px;">${introText}</p>
    
    <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px 0; color: #7c3aed; font-size: 20px;">${experience.title}</h2>
      
      ${experience.category ? `<p style="margin: 0 0 12px 0;"><strong>Categoria:</strong> ${experience.category}</p>` : ''}
      ${experience.association_name ? `<p style="margin: 0 0 12px 0;"><strong>Associazione:</strong> ${experience.association_name}</p>` : ''}
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>📅 Data:</strong> ${formatDate(experienceDate.start_datetime)}</p>
        <p style="margin: 0;"><strong>🕐 Orario:</strong> ${formatTime(experienceDate.start_datetime)} - ${formatTime(experienceDate.end_datetime)}</p>
      </div>
      
      ${experience.city || experience.address ? `
      <div style="margin-top: 16px;">
        <p style="margin: 0;"><strong>📍 Luogo:</strong></p>
        ${experience.city ? `<p style="margin: 4px 0 0 0;">${experience.city}</p>` : ''}
        ${experience.address ? `<p style="margin: 4px 0 0 0; color: #666;">${experience.address}</p>` : ''}
      </div>
      ` : ''}
      
      ${experience.description ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #666;">${experience.description}</p>
      </div>
      ` : ''}
    </div>
    
    <p style="white-space: pre-line; margin-bottom: 0;">${closingText}</p>
  </div>
  
  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 16px 16px; text-align: center;">
    <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
      Questa email è stata inviata automaticamente da Bravo! - La piattaforma per il volontariato aziendale
    </p>
  </div>
</body>
</html>
    `;

    // Check if we have Resend API key
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, logging email instead");
      console.log("Would send email to:", profile.email);
      console.log("Subject:", subject);
      
      // Log the email attempt
      await supabase.from("email_logs").insert({
        booking_id: booking_id,
        email_type: "booking_confirmation",
        status: "simulated",
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email simulated (RESEND_API_KEY not configured)",
          to: profile.email 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bravo! <noreply@notifications.bravoapp.it>",
        to: [profile.email],
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailResult);
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`);
    }

    console.log("Email sent successfully:", emailResult);

    // Log the sent email
    await supabase.from("email_logs").insert({
      booking_id: booking_id,
      email_type: "booking_confirmation",
      status: "sent",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation email sent", id: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});