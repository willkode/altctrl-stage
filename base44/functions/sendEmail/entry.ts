import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const BATCH_SIZE = 100; // Resend batch limit

async function sendBatch(messages) {
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });
  return res;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { audience = 'all', subject, body, from_name = 'AltCtrl' } = await req.json();

    if (!subject || !body) {
      return Response.json({ error: 'Missing required fields: subject, body' }, { status: 400 });
    }

    // Assemble recipients server-side
    let emails = [];

    if (audience === 'users' || audience === 'all') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      emails.push(...users.map(u => u.email).filter(Boolean));
    }

    if (audience === 'waitlist' || audience === 'all') {
      const waitlist = await base44.asServiceRole.entities.WaitlistEntry.filter({ is_sample: false }, '-created_date', 500);
      emails.push(...waitlist.map(w => w.email).filter(Boolean));
    }

    // Deduplicate case-insensitively
    const unique = [...new Set(emails.map(e => e.toLowerCase()))];

    // Build message objects
    const messages = unique.map(email => ({
      from: `${from_name} <noreply@altctrl.us>`,
      to: [email],
      subject,
      html: body,
    }));

    // Send in batches of 100
    let sent = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const chunk = messages.slice(i, i + BATCH_SIZE);
      const res = await sendBatch(chunk);
      if (res.ok) {
        const data = await res.json();
        sent += Array.isArray(data) ? data.length : chunk.length;
      } else {
        const err = await res.json();
        failed += chunk.length;
        errors.push({ batch: i / BATCH_SIZE, error: err.message || 'Unknown error' });
      }
      // Brief pause between batches
      if (i + BATCH_SIZE < messages.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    return Response.json({ sent, failed, total: unique.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});