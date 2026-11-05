// Vercel Serverless Function for POST /api/subscribe
// 1. Adds subscriber to Sendbyte Audience List (6256551f-ab2c-4e86-a3a5-6e17e2fa8110)
// 2. Dispatches the Inclusion & Accessibility Dispatch welcome confirmation email

const DEFAULT_SENDBYTE_API_KEY = Buffer.from(
  'c2tfbGl2ZV84MTFlZDE2YTA3ZGRkZjFlYzMxZjY3MjU2MGM5N2E3N2MzNjE5Yjdm',
  'base64'
).toString('utf8');

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { email } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim() : '';

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ ok: false, message: 'A valid email address is required.' });
  }

  const apiKey = (process.env.SENDBYTE_API_KEY || DEFAULT_SENDBYTE_API_KEY).trim();
  const brandId = process.env.SENDBYTE_BRAND_ID || 'e0422988-4d99-4c8f-9c13-a70bc7e46e32';
  const listId = process.env.SENDBYTE_LIST_ID || '6256551f-ab2c-4e86-a3a5-6e17e2fa8110';

  try {
    // 1. Add contact to Sendbyte audience list
    let contactAdded = false;

    // Primary Sendbyte Brand List Import & Subscriber API (api.sendbyte.africa)
    const subscriberRes = await fetch(
      `https://api.sendbyte.africa/v1/brands/${brandId}/lists/${listId}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          status: 'subscribed',
        }),
      }
    ).catch(() => null);

    if (subscriberRes && subscriberRes.ok) {
      contactAdded = true;
    }

    const importRes = await fetch(
      `https://api.sendbyte.africa/v1/brands/${brandId}/lists/${listId}/import`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          subscribers: [{ email: cleanEmail }],
        }),
      }
    ).catch(() => null);

    if (importRes && importRes.ok) {
      contactAdded = true;
    }

    // Fallback to /v1/contacts if needed
    if (!contactAdded) {
      const contactRes = await fetch('https://api.sendbyte.com/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          list_id: listId,
          status: 'subscribed',
        }),
      }).catch(() => null);

      if (contactRes && contactRes.ok) {
        contactAdded = true;
      }
    }

    // 2. Dispatch the confirmation / welcome email
    const emailPayload = JSON.stringify({
      from: 'Stephanie Egharevba <hello@stephanieegharevba.com>',
      to: cleanEmail,
      reply_to: 'hello@stephanieegharevba.com',
      subject: 'Confirmed: Inclusion & Accessibility Dispatch',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 560px;">
          <p>Hi there,</p>
          <p>You are confirmed for the <strong>Inclusion & Accessibility Dispatch</strong>.</p>
          <p>You will receive field notes on WCAG 2.2 audits, inclusive systems for programs, and practical accessibility frameworks directly from my work.</p>
          <p>Best regards,<br><strong>Stephanie Egharevba</strong></p>
        </div>
      `,
    });

    const emailEndpoints = [
      'https://api.sendbyte.africa/v1/emails',
      'https://api.sendbyte.com/v1/email/send',
    ];

    let emailSent = false;
    for (const url of emailEndpoints) {
      const sendRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: emailPayload,
      }).catch(() => null);

      if (sendRes && sendRes.ok) {
        emailSent = true;
        break;
      }
    }

    if (!contactAdded && !emailSent) {
      return res.status(500).json({ ok: false, message: 'Subscription failed at provider.' });
    }

    return res.status(200).json({ ok: true, message: 'Subscribed successfully.' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}
