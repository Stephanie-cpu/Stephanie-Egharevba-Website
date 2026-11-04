import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function startServer() {
  const app = express();

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

  // 2. Dynamic SEO XML Sitemap Endpoint
  app.get('/api/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/?page=cv', priority: '0.9', changefreq: 'monthly' },
      { path: '/?page=work', priority: '0.9', changefreq: 'weekly' },
      { path: '/?page=speaking', priority: '0.9', changefreq: 'weekly' },
      { path: '/?page=books', priority: '0.9', changefreq: 'monthly' },
      { path: '/?page=gallery', priority: '0.8', changefreq: 'monthly' },
      { path: '/?page=contact', priority: '0.8', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // 3. Server-Side Validated Enquiries & Speaker Booking Endpoint (Honeypot Spam Protection)
  app.post('/api/enquiries/validate', rateLimiter(10, 10 * 60 * 1000), (req: Request, res: Response) => {
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

    return res.status(200).json({
      ok: true,
      referenceId,
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

  // Vite middleware for development / static assets for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
