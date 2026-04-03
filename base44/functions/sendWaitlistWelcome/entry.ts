import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, name } = await req.json();

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    const firstName = name ? name.split(' ')[0] : 'Creator';

    const html = `
      <div style="font-family: monospace; background: #020408; color: #e2e8f0; padding: 40px; max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 24px;">
          <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/9e338f22f_altctrl-logo2.png" alt="AltCtrl" style="height: 40px;" />
        </div>
        <div style="color: #00f5ff; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px;">// SIGNAL RECEIVED</div>
        <h1 style="color: #ffffff; font-size: 28px; text-transform: uppercase; margin: 0 0 16px 0; letter-spacing: 1px;">
          YOU'RE IN, ${firstName.toUpperCase()}.
        </h1>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
          Your Founding Creator spot is locked in. We'll reach out when your access is ready.
        </p>
        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.7; margin-bottom: 8px;">
          In the meantime, join the AltCtrl Discord — connect with other founding creators, get early updates, and help shape what we build next.
        </p>
        <div style="margin: 32px 0;">
          <a href="https://discord.gg/REEsXazF8t"
             style="display: inline-block; background: linear-gradient(135deg, #00f5ff, #0099aa); color: #020408; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-size: 13px;">
            JOIN THE DISCORD →
          </a>
        </div>
        <p style="color: #475569; font-size: 12px; margin-top: 40px; border-top: 1px solid #0f172a; padding-top: 20px;">
          // ALTCTRL — AI OS FOR TIKTOK LIVE GAMING CREATORS<br/>
          altctrl.us
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AltCtrl <noreply@altctrl.us>',
        to: [email],
        subject: "You're in — join the AltCtrl Discord",
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data.message || 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});