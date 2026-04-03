import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { to, subject, body, from_name = 'AltCtrl' } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    const emails = Array.isArray(to) ? to : [to];
    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const email of emails) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${from_name} <noreply@altctrl.us>`,
          to: [email],
          subject,
          html: body,
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        const err = await res.json();
        failed++;
        errors.push({ email, error: err.message || 'Unknown error' });
      }
      // Respect Resend's 5 req/s rate limit
      await new Promise(r => setTimeout(r, 250));
    }

    return Response.json({ sent, failed, total: emails.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});