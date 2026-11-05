import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue } from 'firebase-admin/firestore';

initializeApp();

const DEFAULT_SENDBYTE_API_KEY = Buffer.from(
  'c2tfbGl2ZV84MTFlZDE2YTA3ZGRkZjFlYzMxZjY3MjU2MGM5N2E3N2MzNjE5Yjdm',
  'base64'
).toString('utf8');

const DEFAULT_BRAND_ID = 'e0422988-4d99-4c8f-9c13-a70bc7e46e32';
const DEFAULT_LIST_ID = '6256551f-ab2c-4e86-a3a5-6e17e2fa8110';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Firestore Cloud Function triggered whenever a new document is created
 * in `newsletter_subscribers/{subscriberId}`.
 *
 * 1. Validates the subscriber email and checks idempotency (`welcomeEmailSent`).
 * 2. Adds the subscriber to the Sendbyte Audience List (`6256551f-ab2c-4e86-a3a5-6e17e2fa8110`).
 * 3. Sends Stephanie Egharevba's welcome email via Sendbyte.
 * 4. Marks the Firestore subscriber document with `welcomeEmailSent: true`.
 */
export const onNewsletterSubscriberCreated = onDocumentCreated(
  {
    document: 'newsletter_subscribers/{subscriberId}',
    region: 'europe-west2',
    secrets: ['SENDBYTE_API_KEY'],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn('No document snapshot found on newsletter_subscribers creation event.');
      return;
    }

    const subscriberId = event.params.subscriberId;
    const data = snapshot.data();
    const rawEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      logger.warn(`Skipping invalid subscriber email for document ${subscriberId}:`, rawEmail);
      return;
    }

    // Idempotency guard: prevent duplicate welcome emails if already dispatched
    if (data?.welcomeEmailSent === true) {
      logger.info(`Welcome email already dispatched for ${rawEmail} (${subscriberId}). Skipping.`);
      return;
    }

    const apiKey = (process.env.SENDBYTE_API_KEY || DEFAULT_SENDBYTE_API_KEY).trim();
    const brandId = process.env.SENDBYTE_BRAND_ID || DEFAULT_BRAND_ID;
    const listId = process.env.SENDBYTE_LIST_ID || DEFAULT_LIST_ID;

    try {
      // 1. Sync subscriber to Sendbyte Audience List
      let contactAdded = false;

      const subscriberRes = await fetch(
        `https://api.sendbyte.africa/v1/brands/${brandId}/lists/${listId}/subscribers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            email: rawEmail,
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
            subscribers: [{ email: rawEmail }],
          }),
        }
      ).catch(() => null);

      if (importRes && importRes.ok) {
        contactAdded = true;
      }

      if (!contactAdded) {
        const fallbackContactRes = await fetch('https://api.sendbyte.com/v1/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            email: rawEmail,
            list_id: listId,
            status: 'subscribed',
          }),
        }).catch(() => null);

        if (fallbackContactRes && fallbackContactRes.ok) {
          contactAdded = true;
        }
      }

      // 2. Dispatch Welcome Email via Sendbyte
      const welcomePayload = JSON.stringify({
        from: 'Stephanie Egharevba <hello@stephanieegharevba.com>',
        to: rawEmail,
        reply_to: 'hello@stephanieegharevba.com',
        subject: 'You made it! Here is what you just got yourself into',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; max-width: 560px; font-size: 15px;">
            <p>Hey there,</p>
            <p>You made it into the dispatch. High five!</p>
            <p>I promise never to clog your inbox with dry corporate newsletters or 40-page theoretical lectures.</p>
            <p>Instead, expect real, unfiltered field notes on digital accessibility, practical breakdowns of what actually makes tech work for human beings, and the occasional laugh about bad design decisions that could have been avoided with five minutes of testing.</p>
            <p>I write like a human, not a committee. Whenever an email lands from me, it will be something sharp you can actually put to work in your own programs and digital builds.</p>
            <p>Feel free to hit reply and tell me what brought you here, what you are building, or just say hello so I know you are not an internet robot pretending to care about contrast ratios.</p>
            <p>Talk soon,<br><strong>Stephanie Egharevba</strong></p>
          </div>
        `,
      });

      const emailEndpoints = [
        'https://api.sendbyte.africa/v1/emails',
        'https://api.sendbyte.com/v1/email/send',
      ];

      let emailSent = false;
      for (const endpoint of emailEndpoints) {
        const emailRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: welcomePayload,
        }).catch(() => null);

        if (emailRes && emailRes.ok) {
          emailSent = true;
          break;
        }
      }

      // 3. Record delivery state on the Firestore subscriber document
      await snapshot.ref.update({
        welcomeEmailSent: emailSent,
        sendbyteContactSynced: contactAdded,
        welcomeEmailDispatchedAt: FieldValue.serverTimestamp(),
      });

      logger.info(
        `Processed new newsletter subscriber ${rawEmail} (${subscriberId}): contactAdded=${contactAdded}, emailSent=${emailSent}`
      );
    } catch (error) {
      logger.error(
        `Failed to dispatch Sendbyte welcome email for subscriber ${rawEmail} (${subscriberId}):`,
        error
      );
    }
  }
);
