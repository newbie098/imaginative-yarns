import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { name, email, feedback } = await req.json();

    if (!feedback?.trim()) {
      return new Response(JSON.stringify({ error: "Feedback is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const senderName = name?.trim() || "Anonymous";
    const replyTo = email?.trim() || undefined;

    const emailBody = [
      `<h2>New feedback from Imaginative Yarns</h2>`,
      `<p><strong>Name:</strong> ${senderName}</p>`,
      email?.trim() ? `<p><strong>Email:</strong> ${email.trim()}</p>` : "",
      `<hr />`,
      `<p><strong>Feedback:</strong></p>`,
      `<p style="white-space: pre-wrap;">${feedback.trim()}</p>`,
    ]
      .filter(Boolean)
      .join("\n");

    const payload: Record<string, unknown> = {
      from: "Imaginative Yarns Feedback <onboarding@resend.dev>",
      to: ["atishdipankar@gmail.com"],
      subject: `Feedback from ${senderName}`,
      html: emailBody,
    };

    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-feedback error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
