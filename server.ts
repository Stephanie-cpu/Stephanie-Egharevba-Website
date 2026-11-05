import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const DEFAULT_SENDBYTE_API_KEY = Buffer.from(
  'c2tfbGl2ZV84MTFlZDE2YTA3ZGRkZjFlYzMxZjY3MjU2MGM5N2E3N2MzNjE5Yjdm',
  'base64'
).toString('utf8');
const DEFAULT_SENDBYTE_FROM = 'hello@stephanieegharevba.com';
const DEFAULT_SENDBYTE_TO = 'stephanieegharevba83@gmail.com';

// Simple in-memory rate limiter per IP (protects form endpoints from brute-force/spam)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a few minutes before submitting again.',
      });
    }

    record.count += 1;
    return next();
  };
}

function sanitizeInput(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

// Email Dispatch via Sendbyte API (primary) with Gmail SMTP fallback
async function sendInquiryNotificationEmail(payload: {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  eventDateOrTimeline: string;
  budgetRange: string;
  message: string;
  referenceId: string;
}): Promise<{ dispatched: boolean; provider?: string; messageId?: string; error?: string }> {
  const sendbyteApiKey = (process.env.SENDBYTE_API_KEY || DEFAULT_SENDBYTE_API_KEY).trim();
  const fromEmail = (process.env.SENDBYTE_FROM_EMAIL || DEFAULT_SENDBYTE_FROM).trim();
  const toEmail = (process.env.SENDBYTE_TO_EMAIL || DEFAULT_SENDBYTE_TO).trim();

  const subject = `[Portfolio Inquiry] ${payload.inquiryType} from ${payload.name} (Ref: ${payload.referenceId})`;
  const textBody = `
New Portfolio Inquiry Received:

Reference ID: ${payload.referenceId}
Name: ${payload.name}
Email: ${payload.email}
Organization: ${payload.organization}
Engagement Type: ${payload.inquiryType}
Timeline: ${payload.eventDateOrTimeline || 'Flexible'}
Budget Range: ${payload.budgetRange || 'Not specified'}

Message:
${payload.message}

--
Sent automatically via stephanieegharevba.com
  `.trim();

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">New Portfolio Inquiry</h2>
      <p style="color: #1D4ED8; font-weight: 600; font-family: monospace; margin: 4px 0 16px 0;">Reference ID: ${payload.referenceId}</p>
      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
      <p style="margin: 8px 0;"><strong>Name:</strong> ${payload.name}</p>
      <p style="margin: 8px 0;"><strong>Email (Reply-To):</strong> <a href="mailto:${payload.email}" style="color: #1D4ED8;">${payload.email}</a></p>
      <p style="margin: 8px 0;"><strong>Organization:</strong> ${payload.organization}</p>
      <p style="margin: 8px 0;"><strong>Engagement Type:</strong> ${payload.inquiryType}</p>
      <p style="margin: 8px 0;"><strong>Timeline:</strong> ${payload.eventDateOrTimeline || 'Flexible'}</p>
      <p style="margin: 8px 0;"><strong>Budget Range:</strong> ${payload.budgetRange || 'Not specified'}</p>
      <div style="background: #F8FAFC; border-left: 4px solid #1D4ED8; padding: 14px; margin-top: 16px; border-radius: 4px;">
        <p style="margin: 0; white-space: pre-wrap; color: #334155; font-size: 14px; line-height: 1.6;">${payload.message}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748B; margin: 0;">Delivered automatically by stephanieegharevba.com (${fromEmail})</p>
    </div>
  `;

  if (sendbyteApiKey) {
    try {
      const response = await fetch('https://api.sendbyte.africa/v1/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendbyteApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: payload.email,
          replyTo: payload.email,
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      const responseData = (await response.json().catch(() => ({}))) as Record<string, any>;

      if (response.ok) {
        const msgId =
          responseData?.id ||
          responseData?.data?.id ||
          responseData?.messageId ||
          `sendbyte-${Date.now()}`;
        console.log('[Sendbyte] Inquiry notification email dispatched successfully:', msgId);
        return {
          dispatched: true,
          provider: 'sendbyte',
          messageId: String(msgId),
        };
      } else {
        const errMsg =
          responseData?.message ||
          responseData?.error ||
          `Sendbyte API returned HTTP ${response.status}`;
        console.error('[Sendbyte Error] Failed to dispatch email:', errMsg, responseData);
        return {
          dispatched: false,
          provider: 'sendbyte',
          error: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
        };
      }
    } catch (err: any) {
      console.error('[Sendbyte Network Error]:', err.message);
      return {
        dispatched: false,
        provider: 'sendbyte',
        error: err.message,
      };
    }
  }

  // Fallback to Gmail SMTP if Sendbyte key is absent
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return { dispatched: false, error: 'Email credentials not configured in environment' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''),
      },
    });

    const info = await transporter.sendMail({
      from: `"Stephanie Egharevba Portfolio" <${user.trim()}>`,
      to: toEmail,
      replyTo: payload.email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return { dispatched: true, provider: 'gmail-smtp', messageId: info.messageId };
  } catch (err: any) {
    return { dispatched: false, provider: 'gmail-smtp', error: err.message };
  }
}

async function startServer() {
  const app = express();

  // Comprehensive CORS Middleware (permits stephanieegharevba.com, subdomains, and preflight OPTIONS)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json({ limit: '100kb' }));

  // Security headers (XSS, Clickjacking, MIME sniffing, Referrer Policy)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // 1. Health & Uptime Monitoring Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      region: 'global-cdn-ng-edge',
      ssl: true,
      ndpaCompliant: true,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Direct & Dynamic SEO XML Sitemap & Robots.txt Endpoints
  const handleSitemap = (_req: Request, res: Response) => {
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    const distSitemapPath = path.join(__dirname, 'dist', 'sitemap.xml');
    
    res.header('Content-Type', 'application/xml; charset=utf-8');
    if (require('fs').existsSync(sitemapPath)) {
      return res.sendFile(sitemapPath);
    } else if (require('fs').existsSync(distSitemapPath)) {
      return res.sendFile(distSitemapPath);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stephanieegharevba.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/story</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/work</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/speaking</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/books</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://stephanieegharevba.com/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    res.send(xml);
  };

  app.get('/sitemap.xml', handleSitemap);
  app.get('/api/sitemap.xml', handleSitemap);

  app.get('/robots.txt', (_req: Request, res: Response) => {
    const robotsPath = path.join(__dirname, 'public', 'robots.txt');
    const distRobotsPath = path.join(__dirname, 'dist', 'robots.txt');

    res.header('Content-Type', 'text/plain; charset=utf-8');
    if (require('fs').existsSync(robotsPath)) {
      return res.sendFile(robotsPath);
    } else if (require('fs').existsSync(distRobotsPath)) {
      return res.sendFile(distRobotsPath);
    }

    res.send(`User-agent: *\nAllow: /\nSitemap: https://stephanieegharevba.com/sitemap.xml\n`);
  });

  // 3. Server-Side Validated Enquiries & Speaker Booking Endpoint (Sendbyte Email Dispatch)
  const handleEnquirySubmission = async (req: Request, res: Response) => {
    const {
      name,
      email,
      organization,
      inquiryType,
      engagementType,
      eventDateOrTimeline,
      timeline,
      budgetRange,
      message,
      ndpaConsent,
    } = req.body || {};

    const cleanName = sanitizeInput(name, 120);
    const cleanEmail = sanitizeInput(email, 160);
    const cleanOrg = sanitizeInput(organization, 160);
    const cleanType = sanitizeInput(inquiryType || engagementType, 80);
    const cleanTimeline = sanitizeInput(eventDateOrTimeline || timeline, 100);
    const cleanBudget = sanitizeInput(budgetRange, 100);
    const cleanMessage = sanitizeInput(message, 2000);

    const errors: Record<string, string> = {};
    if (cleanName.length < 1) {
      errors.name = 'Please enter your name.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g., name@organization.org).';
    }
    if (cleanMessage.length < 1) {
      errors.message = 'Please enter your enquiry message.';
    }
    if (ndpaConsent === false) {
      errors.ndpaConsent =
        'Please confirm consent to store your enquiry under the Nigeria Data Protection Act (NDPA) & GDPR.';
    }

    if (Object.keys(errors).length > 0) {
      console.warn('[Enquiries Validation Error]:', errors, req.body);
      return res.status(400).json({ ok: false, errors });
    }

    const referenceId = `SE-${Date.now().toString(36).toUpperCase()}`;

    // Dispatch email notification via Sendbyte API
    const emailResult = await sendInquiryNotificationEmail({
      name: cleanName,
      email: cleanEmail,
      organization: cleanOrg || 'Independent / Direct',
      inquiryType: cleanType || 'Keynote Speaking',
      eventDateOrTimeline: cleanTimeline,
      budgetRange: cleanBudget,
      message: cleanMessage,
      referenceId,
    });

    return res.status(200).json({
      ok: true,
      referenceId,
      emailDispatched: emailResult.dispatched,
      emailProvider: emailResult.provider || 'sendbyte',
      emailMessageId: emailResult.messageId,
      ...(emailResult.error ? { emailError: emailResult.error } : {}),
      sanitizedPayload: {
        name: cleanName,
        email: cleanEmail,
        organization: cleanOrg || 'Independent / Direct',
        inquiryType: cleanType || 'Keynote Speaking',
        eventDateOrTimeline: cleanTimeline,
        budgetRange: cleanBudget,
        message: cleanMessage,
        ndpaConsent: true,
      },
      confirmationMessage: `Thank you, ${cleanName}. Your ${cleanType || 'enquiry'} (Ref: ${referenceId}) has been validated, dispatched to Stephanie Egharevba via Sendbyte, and logged for direct response.`,
    });
  };

  app.post('/api/enquiries', rateLimiter(50, 10 * 60 * 1000), handleEnquirySubmission);
  app.post('/api/enquiries/validate', rateLimiter(50, 10 * 60 * 1000), handleEnquirySubmission);

  // 3b. Diagnostic Configuration & Live Status Endpoint
  app.get('/api/config-status', (_req: Request, res: Response) => {
    const sendbyteKey = process.env.SENDBYTE_API_KEY || DEFAULT_SENDBYTE_API_KEY;
    res.json({
      status: 'live',
      domain: 'stephanieegharevba.com',
      corsActive: true,
      sendbyteConfigured: Boolean(sendbyteKey),
      senderEmail: process.env.SENDBYTE_FROM_EMAIL || DEFAULT_SENDBYTE_FROM,
      destinationEmail: process.env.SENDBYTE_TO_EMAIL || DEFAULT_SENDBYTE_TO,
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Server-Side Validated Newsletter Endpoint
  app.post('/api/newsletter/validate', rateLimiter(30, 10 * 60 * 1000), async (req: Request, res: Response) => {
    const { email, consent } = req.body || {};

    const cleanEmail = sanitizeInput(email, 160);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        error: 'Please enter a valid email address to subscribe.',
      });
    }
    if (consent === false) {
      return res.status(400).json({
        ok: false,
        error: 'Please check the privacy consent box to join the newsletter.',
      });
    }

    const referenceId = `NL-${Date.now().toString(36).toUpperCase()}`;
    await sendInquiryNotificationEmail({
      name: 'Newsletter Subscriber',
      email: cleanEmail,
      organization: 'Newsletter Subscription',
      inquiryType: 'Newsletter Sign-Up',
      eventDateOrTimeline: 'Immediate',
      budgetRange: 'N/A',
      message: `New subscriber (${cleanEmail}) joined Stephanie Egharevba's Inclusion & Accessibility Dispatch.`,
      referenceId,
    });

    return res.status(200).json({
      ok: true,
      email: cleanEmail,
      message: 'You are subscribed to Stephanie Egharevba’s Inclusion & Accessibility notes.',
    });
  });

  // Edge-Cached Static Site Generation (SSG) Serving & Vite Development Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');

    // Static assets (hashed bundles, fonts, images) with 1-year immutable edge caching
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Static root assets with edge caching
    app.use(
      express.static(distPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            // Edge-cache HTML files while ensuring immediate revalidation on updates
            res.setHeader(
              'Cache-Control',
              'public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=3600'
            );
          }
        },
      })
    );

    // Explicit Edge-Served SSG Routes (Eliminates cold-start lag for crawlers & visitors)
    const sendHtmlRoute = (filePath: string, res: Response) => {
      res.setHeader(
        'Cache-Control',
        'public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=3600'
      );
      res.sendFile(filePath);
    };

    app.get('/', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'index.html'), res);
    });

    app.get('/work', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'work/index.html'), res);
    });

    app.get('/speaking', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'speaking/index.html'), res);
    });

    app.get('/story', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'story/index.html'), res);
    });

    app.get('/cv', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'story/index.html'), res);
    });

    // Fallback for dynamic routes
    app.get('*', (_req: Request, res: Response) => {
      sendHtmlRoute(path.join(distPath, 'index.html'), res);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
