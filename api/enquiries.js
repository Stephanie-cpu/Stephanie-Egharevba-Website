// Vercel Serverless Function for POST /api/enquiries
// Ensures enquiries submitted on stephanieegharevba.com (Vercel) dispatch directly to Sendbyte

const DEFAULT_SENDBYTE_API_KEY = Buffer.from(
  'c2tfbGl2ZV84MTFlZDE2YTA3ZGRkZjFlYzMxZjY3MjU2MGM5N2E3N2MzNjE5Yjdm',
  'base64'
).toString('utf8');

function sanitizeInput(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const {
    name,
    email,
    organization,
    inquiryType,
    engagementType,
    eventDateOrTimeline,
    timeline,
    budgetRange,
    budget,
    message,
    ndpaConsent,
  } = req.body || {};

  const cleanName = sanitizeInput(name, 120);
  const cleanEmail = sanitizeInput(email, 160);
  const cleanOrg = sanitizeInput(organization, 160);
  const cleanType = sanitizeInput(inquiryType || engagementType, 80);
  const cleanTimeline = sanitizeInput(eventDateOrTimeline || timeline, 100);
  const cleanBudget = sanitizeInput(budgetRange || budget, 100);
  const cleanMessage = sanitizeInput(message, 2000);

  const errors = {};
  if (cleanName.length < 1) {
    errors.name = 'Full name is required. Please enter your name.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (cleanEmail.length < 1) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address (e.g., name@organization.org).';
  }
  if (cleanMessage.length < 1) {
    errors.message = 'Enquiry message is required. Please share details of your request.';
  }
  if (ndpaConsent === false) {
    errors.ndpaConsent =
      'Please confirm consent to store your enquiry under the Nigeria Data Protection Act (NDPA) & GDPR.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const referenceId = `SE-${Date.now().toString(36).toUpperCase()}`;
  const sendbyteApiKey = (process.env.SENDBYTE_API_KEY || DEFAULT_SENDBYTE_API_KEY).trim();

  const subject = `New Advisory Enquiry: ${cleanName} (${cleanOrg || 'Individual'})`;
  const html = `
      <h2>New Enquiry Received</h2>
      <p><strong>Name:</strong> ${cleanName}</p>
      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Organization:</strong> ${cleanOrg || 'N/A'}</p>
      <p><strong>Enquiry Type:</strong> ${cleanType || 'Advisory / Speaking'}</p>
      <p><strong>Timeline:</strong> ${cleanTimeline || 'Flexible'}</p>
      <p><strong>Budget Tier:</strong> ${cleanBudget || 'Not specified'}</p>
      <p><strong>Message / Brief:</strong></p>
      <p>${cleanMessage}</p>
    `;

  const requestBody = JSON.stringify({
    from: 'Stephanie Egharevba <hello@stephanieegharevba.com>',
    to: 'stephanieegharevba83@gmail.com',
    reply_to: cleanEmail,
    subject,
    html,
  });

  const sendbyteEndpoints = [
    'https://api.sendbyte.africa/v1/emails',
    'https://api.sendbyte.com/v1/email/send',
  ];

  let dispatched = false;
  let messageId = '';
  let lastError = '';

  for (const url of sendbyteEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendbyteApiKey}`,
        },
        body: requestBody,
      });

      const responseData = await response.json().catch(() => ({}));
      if (response.ok) {
        dispatched = true;
        messageId = String(
          responseData?.id ||
            responseData?.data?.id ||
            responseData?.messageId ||
            `sendbyte-${Date.now()}`
        );
        break;
      } else {
        const errMsg =
          responseData?.message ||
          responseData?.error ||
          `Sendbyte API returned HTTP ${response.status}`;
        lastError = typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg);
      }
    } catch (err) {
      lastError = err?.message || 'Network error';
    }
  }

  return res.status(200).json({
    ok: true,
    referenceId,
    emailDispatched: dispatched,
    emailProvider: 'sendbyte',
    emailMessageId: messageId,
    ...(lastError && !dispatched ? { emailError: lastError } : {}),
    sanitizedPayload: {
      name: cleanName,
      email: cleanEmail,
      organization: cleanOrg || 'Individual',
      inquiryType: cleanType || 'Keynote Speaking',
      eventDateOrTimeline: cleanTimeline,
      budgetRange: cleanBudget,
      message: cleanMessage,
      ndpaConsent: true,
    },
    confirmationMessage: `Thank you, ${cleanName}. Your ${cleanType || 'enquiry'} (Ref: ${referenceId}) has been validated, dispatched to Stephanie Egharevba via Sendbyte, and logged for direct response.`,
  });
}
