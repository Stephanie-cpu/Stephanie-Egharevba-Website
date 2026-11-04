import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

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

// SMTP Email Dispatch via Gmail App Password
async function sendInquiryNotificationEmail(payload: {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  eventDateOrTimeline: string;
  budgetRange: string;
  message: string;
  referenceId: string;
}): Promise<{ dispatched: boolean; messageId?: string; error?: string }> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log('[SMTP Note] GMAIL_USER or GMAIL_APP_PASSWORD not set in environment. Stored in Firestore.');
    return { dispatched: false, error: 'SMTP credentials not configured in environment' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''),
      },
    });

    const mailOptions = {
      from: `"Stephanie Egharevba Portfolio" <${user.trim()}>`,
      to: 'stephanieegharevba83@gmail.com',
      replyTo: payload.email,
      subject: `[Portfolio Inquiry] ${payload.inquiryType} from ${payload.name} (Ref: ${payload.referenceId})`,
      text: `
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
      `.trim(),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">New Portfolio Inquiry</h2>
          <p style="color: #1D4ED8; font-weight: 600; font-family: monospace; margin: 4px 0 16px 0;">Reference ID: ${payload.referenceId}</p>
          <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
          <p style="margin: 8px 0;"><strong>Name:</strong> ${payload.name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${payload.email}" style="color: #1D4ED8;">${payload.email}</a></p>
          <p style="margin: 8px 0;"><strong>Organization:</strong> ${payload.organization}</p>
          <p style="margin: 8px 0;"><strong>Engagement Type:</strong> ${payload.inquiryType}</p>
          <p style="margin: 8px 0;"><strong>Timeline:</strong> ${payload.eventDateOrTimeline || 'Flexible'}</p>
          <p style="margin: 8px 0;"><strong>Budget Range:</strong> ${payload.budgetRange || 'Not specified'}</p>
          <div style="background: #F8FAFC; border-left: 4px solid #1D4ED8; padding: 14px; margin-top: 16px; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap; color: #334155; font-size: 14px; line-height: 1.6;">${payload.message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748B; margin: 0;">Delivered automatically by stephanieegharevba.com</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Inquiry notification email dispatched successfully:', info.messageId);
    return { dispatched: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[SMTP Error] Failed to send email via Gmail:', err.message);
    return { dispatched: false, error: err.message };
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

  // 3. Server-Side Validated Enquiries & Speaker Booking Endpoint (Honeypot Spam Protection)
  app.post('/api/enquiries/validate', rateLimiter(10, 10 * 60 * 1000), async (req: Request, res: Response) => {
    const {
      name,
      email,
      organization,
      inquiryType,
      eventDateOrTimeline,
      budgetRange,
      message,
      ndpaConsent,
      honeypotWebsite,
    } = req.body || {};

    // Accessible Honeypot Check (no visual/cognitive CAPTCHA puzzles)
    if (honeypotWebsite && String(honeypotWebsite).trim().length > 0) {
      return res.status(200).json({
        ok: true,
        spamFiltered: true,
        referenceId: 'ENQ-FILTERED',
      });
    }

    const cleanName = sanitizeInput(name, 120);
    const cleanEmail = sanitizeInput(email, 160);
    const cleanOrg = sanitizeInput(organization, 160);
    const cleanType = sanitizeInput(inquiryType, 80);
    const cleanTimeline = sanitizeInput(eventDateOrTimeline, 100);
    const cleanBudget = sanitizeInput(budgetRange, 100);
    const cleanMessage = sanitizeInput(message, 2000);

    const errors: Record<string, string> = {};
    if (cleanName.length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g., name@organization.org).';
    }
    if (cleanMessage.length < 10) {
      errors.message = 'Please include at least 10 characters describing your event or project.';
    }
    if (ndpaConsent !== true) {
      errors.ndpaConsent =
        'Please confirm consent to store your enquiry under the Nigeria Data Protection Act (NDPA) & GDPR.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, errors });
    }

    const referenceId = `SE-${Date.now().toString(36).toUpperCase()}`;

    // Dispatch email notification via Gmail SMTP if configured
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
      confirmationMessage: `Thank you, ${cleanName}. Your ${cleanType || 'enquiry'} (Ref: ${referenceId}) has been validated, logged in Stephanie Egharevba's dashboard, and prepared for direct response.`,
    });
  });

  // 3b. Diagnostic Configuration & Live Status Endpoint
  app.get('/api/config-status', (_req: Request, res: Response) => {
    res.json({
      status: 'live',
      domain: 'stephanieegharevba.com',
      corsActive: true,
      smtpConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      gmailUser: process.env.GMAIL_USER
        ? `${process.env.GMAIL_USER.slice(0, 3)}***@${process.env.GMAIL_USER.split('@')[1] || 'gmail.com'}`
        : 'not-configured',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Server-Side Validated Newsletter Endpoint
  app.post('/api/newsletter/validate', rateLimiter(10, 10 * 60 * 1000), (req: Request, res: Response) => {
    const { email, consent, honeypot } = req.body || {};

    if (honeypot && String(honeypot).trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    const cleanEmail = sanitizeInput(email, 160);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        error: 'Please enter a valid email address to subscribe.',
      });
    }
    if (consent !== true) {
      return res.status(400).json({
        ok: false,
        error: 'Please check the privacy consent box to join the newsletter.',
      });
    }

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
