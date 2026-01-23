import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log("Starting reminder check at:", new Date().toISOString());

    // Get all email settings to know reminder hours for each company
    const { data: allSettings, error: settingsError } = await supabase
      .from("email_settings")
      .select("company_id, reminder_enabled, reminder_hours_before");

    if (settingsError) {
      console.error("Error fetching email settings:", settingsError);
    }

    // Create a map of company_id -> settings
    const settingsMap = new Map<string, { enabled: boolean; hours: number }>();
    for (const setting of allSettings || []) {
      settingsMap.set(setting.company_id, {
        enabled: setting.reminder_enabled,
        hours: setting.reminder_hours_before,
      });
    }

    // Default reminder hours if no settings exist
    const defaultReminderHours = 24;

    // Get all confirmed bookings for experience dates happening soon
    // We'll check for various time windows based on company settings
    const now = new Date();
    const maxHoursAhead = 48; // Look up to 48 hours ahead to cover all settings
    const maxTime = new Date(now.getTime() + maxHoursAhead * 60 * 60 * 1000);

    const { data: upcomingDates, error: datesError } = await supabase
      .from("experience_dates")
      .select(`
        id,
        start_datetime,
        end_datetime,
        company_id,
        experience_id,
        experiences (
          title,
          description,
          city,
          address,
          association_name,
          category
        )
      `)
      .gte("start_datetime", now.toISOString())
      .lte("start_datetime", maxTime.toISOString());

    if (datesError) {
      throw new Error(`Error fetching experience dates: ${datesError.message}`);
    }

    console.log(`Found ${upcomingDates?.length || 0} upcoming experience dates`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const expDate of upcomingDates || []) {
      // Get settings for this company
      const companySettings = expDate.company_id ? settingsMap.get(expDate.company_id) : null;
      const reminderEnabled = companySettings?.enabled ?? true;
      const reminderHours = companySettings?.hours ?? defaultReminderHours;

      if (!reminderEnabled) {
        console.log(`Reminders disabled for company ${expDate.company_id}`);
        continue;
      }

      // Check if this date is within the reminder window
      const dateTime = new Date(expDate.start_datetime);
      const hoursUntilEvent = (dateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Only send reminder if within the hour window (e.g., between 24h and 23h before)
      if (hoursUntilEvent > reminderHours || hoursUntilEvent < reminderHours - 1) {
        continue;
      }

      console.log(`Processing reminders for date ${expDate.id}, ${hoursUntilEvent.toFixed(1)} hours until event`);

      // Get all confirmed bookings for this date
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, user_id")
        .eq("experience_date_id", expDate.id)
        .eq("status", "confirmed");

      if (bookingsError) {
        console.error(`Error fetching bookings for date ${expDate.id}:`, bookingsError);
        continue;
      }

      for (const booking of bookings || []) {
        // Check if reminder was already sent
        const { data: existingLog } = await supabase
          .from("email_logs")
          .select("id")
          .eq("booking_id", booking.id)
          .eq("email_type", "booking_reminder")
          .single();

        if (existingLog) {
          console.log(`Reminder already sent for booking ${booking.id}`);
          emailsSkipped++;
          continue;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, first_name, last_name, company_id")
          .eq("id", booking.user_id)
          .single();

        if (profileError || !profile) {
          console.error(`Profile not found for user ${booking.user_id}`);
          continue;
        }

        // Get email template
        const { data: template } = await supabase
          .from("email_templates")
          .select("subject, intro_text, closing_text")
          .eq("company_id", profile.company_id)
          .eq("template_type", "booking_reminder")
          .single();

        const experience = expDate.experiences as any;
        const subject = template?.subject || `Promemoria: ${experience?.title} - Domani!`;
        const introText = template?.intro_text || `Ciao ${profile.first_name || ""},\n\nTi ricordiamo che domani hai un'esperienza di volontariato!`;
        const closingText = template?.closing_text || "Non vediamo l'ora di vederti! Grazie per il tuo impegno.\n\nIl team Bravo!";

        // Build email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promemoria Esperienza</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Promemoria</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">La tua esperienza è domani!</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="white-space: pre-line; margin-bottom: 24px;">${introText}</p>
    
    <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px 0; color: #f97316; font-size: 20px;">${experience?.title}</h2>
      
      ${experience?.category ? `<p style="margin: 0 0 12px 0;"><strong>Categoria:</strong> ${experience.category}</p>` : ''}
      ${experience?.association_name ? `<p style="margin: 0 0 12px 0;"><strong>Associazione:</strong> ${experience.association_name}</p>` : ''}
      
      <div style="background: #fff7ed; padding: 16px; border-radius: 8px; margin: 16px 0; border: 2px solid #fed7aa;">
        <p style="margin: 0 0 8px 0;"><strong>📅 Data:</strong> ${formatDate(expDate.start_datetime)}</p>
        <p style="margin: 0;"><strong>🕐 Orario:</strong> ${formatTime(expDate.start_datetime)} - ${formatTime(expDate.end_datetime)}</p>
      </div>
      
      ${experience?.city || experience?.address ? `
      <div style="margin-top: 16px;">
        <p style="margin: 0;"><strong>📍 Luogo:</strong></p>
        ${experience.city ? `<p style="margin: 4px 0 0 0;">${experience.city}</p>` : ''}
        ${experience.address ? `<p style="margin: 4px 0 0 0; color: #666;">${experience.address}</p>` : ''}
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
          console.log("RESEND_API_KEY not configured, logging reminder instead");
          console.log("Would send reminder to:", profile.email);

          await supabase.from("email_logs").insert({
            booking_id: booking.id,
            email_type: "booking_reminder",
            status: "simulated",
          });

          emailsSent++;
          continue;
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
          console.error(`Failed to send reminder to ${profile.email}:`, emailResult);
          continue;
        }

        console.log(`Reminder sent to ${profile.email}`);

        // Log the sent email
        await supabase.from("email_logs").insert({
          booking_id: booking.id,
          email_type: "booking_reminder",
          status: "sent",
        });

        emailsSent++;
      }
    }

    console.log(`Reminder job complete. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_sent: emailsSent,
        emails_skipped: emailsSkipped,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-booking-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});