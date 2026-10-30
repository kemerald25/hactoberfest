/**
 * @fileOverview Core WhatsApp Bridge process for ReplyIQ.
 * Uses whatsapp-web.js to manage the admin bot and route messages to/from Next.js.
 */

require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Simple HTTP server for Render health checks (Web Service port-binding)
const port = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ReplyIQ WhatsApp Bridge Running');
});
server.listen(port, () => {
  console.log(`[WhatsApp Bridge] Health check server listening on port ${port}`);
});

// Initialize the WhatsApp Web client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check'
    ]
  }
});

// Output QR code in terminal for authentication
client.on('qr', (qr) => {
  console.log('\n======================================================================');
  console.log('Scan the QR code below with your WhatsApp app to log in:');
  console.log('======================================================================\n');
  qrcode.generate(qr, { small: true });
  console.log('\n----------------------------------------------------------------------');
  console.log('If the terminal QR code is distorted or not scanning, open this link in your browser:');
  console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
  console.log('======================================================================\n');
});

// Log readiness
client.on('ready', () => {
  console.log('\n[WhatsApp Bridge] Admin bot is logged in, ready, and listening for messages!\n');
});

// Log authentication success
client.on('authenticated', () => {
  console.log('[WhatsApp Bridge] Session authenticated successfully!');
});

// Log authentication failure
client.on('auth_failure', (msg) => {
  console.error('[WhatsApp Bridge] Session authentication failed:', msg);
});

// Log disconnection
client.on('disconnected', (reason) => {
  console.log('[WhatsApp Bridge] Session was disconnected/logged out:', reason);
});

// Handle incoming messages
client.on('message', async (msg) => {
  try {
    // 1. Ignore group messages
    if (msg.from.endsWith('@g.us')) {
      return;
    }

    // 2. Ignore non-text messages (only process 'chat' type)
    if (msg.type !== 'chat') {
      return;
    }

    // 3. Ignore empty message bodies
    const body = msg.body ? msg.body.trim() : '';
    if (!body) {
      return;
    }

    const phone = msg.from; // format: 'phone_number@c.us'

    // Check if message is a deep link start command
    if (body.startsWith('START:')) {
      const businessIdPart = body.substring(6).trim();

      // Edge case: exactly 'START:' with no business ID
      if (!businessIdPart) {
        await msg.reply(
          "Welcome! It looks like you tried to connect but didn't provide a business ID. Please use the official link provided by the business to connect."
        );
        return;
      }

      // Edge case: check for special or invalid URL/Supabase characters to reject bad inputs
      const isValidId = /^[a-zA-Z0-9_-]+$/.test(businessIdPart);
      if (!isValidId) {
        await msg.reply(
          "Welcome! The connection link you used appears to be invalid or broken. Please contact the business to get a valid start link."
        );
        return;
      }

      // Register session
      try {
        const apiBaseUrl = process.env.NEXT_API_BASE_URL || 'http://localhost:9002';
        const secret = process.env.REPLYIQ_SHARED_SECRET;

        if (!secret) {
          throw new Error('REPLYIQ_SHARED_SECRET environment variable is missing.');
        }

        const response = await fetch(`${apiBaseUrl}/api/whatsapp/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-replyiq-secret': secret
          },
          body: JSON.stringify({
            phone: phone,
            businessId: businessIdPart
          })
        });

        if (!response.ok) {
          // HTTP Error state (non-2xx response from Next.js)
          const errText = await response.text();
          console.error(`[WhatsApp Bridge] HTTP Error registering session. Status: ${response.status}. Details: ${errText}`);
          await msg.reply(
            "We're sorry, but we encountered a technical issue while registering your chat session. Please try again in a few moments."
          );
          return;
        }

        const data = await response.json();
        if (!data.success) {
          // Application error from Next.js (e.g. business not found)
          console.error(`[WhatsApp Bridge] Application Error registering session: ${data.error}`);
          if (response.status === 404 || data.error === "Business not found") {
            await msg.reply(
              "Welcome! We couldn't find the business associated with this link. The link might be outdated or invalid."
            );
          } else {
            await msg.reply(
              "We're sorry, but we couldn't start a chat session for you at this time. Please contact the business support team."
            );
          }
          return;
        }

        // Onboarding confirmation: addresses customer warmly, lets them know they are connected to right business assistant
        const businessName = data.businessName || 'the business';
        await msg.reply(
          `Hello! Welcome to our chat. You are now connected to the official virtual assistant for ${businessName}. How can we help you today?`
        );

      } catch (error) {
        // Network Error state (Next.js app offline/unreachable)
        console.error('[WhatsApp Bridge] Network/System Error registering session:', error.message || error);
        await msg.reply(
          "We're having trouble connecting to our servers. Please check your internet connection and try again later."
        );
      }
      return;
    }

    // Normal message processing
    try {
      const apiBaseUrl = process.env.NEXT_API_BASE_URL || 'http://localhost:9002';
      const secret = process.env.REPLYIQ_SHARED_SECRET;

      if (!secret) {
        throw new Error('REPLYIQ_SHARED_SECRET environment variable is missing.');
      }

      const response = await fetch(`${apiBaseUrl}/api/whatsapp/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-replyiq-secret': secret
        },
        body: JSON.stringify({
          phone: phone,
          message: body
        })
      });

      if (!response.ok) {
        // HTTP Error state (non-2xx response from Next.js)
        const errText = await response.text();
        console.error(`[WhatsApp Bridge] HTTP Error sending message. Status: ${response.status}. Details: ${errText}`);
        await msg.reply(
          "I'm sorry, I encountered an issue retrieving a response from our system. Please try again shortly."
        );
        return;
      }

      const data = await response.json();

      if (data.noSession) {
        // No active session exists for this phone number
        await msg.reply(
          "Hi! It looks like you don't have an active chat session. Please use the official link provided by the business to start a conversation."
        );
        return;
      }

      if (!data.success) {
        // Application error
        console.error(`[WhatsApp Bridge] Application Error in message response: ${data.error}`);
        await msg.reply(
          "I encountered an error processing your message. Please try again."
        );
        return;
      }

      if (!data.reply) {
        // Application Error: 200 OK but no reply text in the body
        console.error('[WhatsApp Bridge] Application Error: Received empty reply field from API.');
        await msg.reply(
          "I received an empty response. Please try sending your message again."
        );
        return;
      }

      // Reply exists, send it back to the customer
      await msg.reply(data.reply);

    } catch (error) {
      // Network Error state (Next.js app offline/unreachable)
      console.error('[WhatsApp Bridge] Network/System Error sending message:', error.message || error);
      await msg.reply(
        "I'm having trouble connecting to the business assistant. Please check your connection or try again later."
      );
    }

  } catch (err) {
    console.error('[WhatsApp Bridge] Fatal handler error:', err);
  }
});

// Initialize the client
client.initialize().catch((err) => {
  console.error('[WhatsApp Bridge] Failed to initialize client:', err);
});
