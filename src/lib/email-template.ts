// Shared email layout wrapper
function wrapBaseLayout(title: string, contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="en" style="color-scheme: only dark; supported-color-schemes: only dark;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="only dark">
        <meta name="supported-color-schemes" content="only dark">
        <title>${title}</title>
        <style>
          :root {
            color-scheme: only dark;
            supported-color-schemes: only dark;
          }
          /* Target mobile email clients and prevent auto inversion */
          body, .body-bg {
            background-color: #030014 !important;
            background: #030014 linear-gradient(#030014, #030014) !important;
            color: #f8fafc !important;
          }
          .card-bg {
            background-color: #09071a !important;
            background: #09071a linear-gradient(#09071a, #09071a) !important;
            color: #f8fafc !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          h1, h2, h3, h4, h5, h6, p, span, td, a {
            color: #cbd5e1 !important;
          }
          a {
            color: #a78bfa !important;
          }
        </style>
      </head>
      <body class="body-bg" style="margin: 0; padding: 0; background-color: #030014; background: #030014 linear-gradient(#030014, #030014) !important; color: #f8fafc !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div class="body-bg" style="background-color: #030014; background: #030014 linear-gradient(#030014, #030014) !important; color: #f8fafc !important; padding: 40px 20px; text-align: center;">
          <div class="card-bg" style="max-width: 600px; margin: 0 auto; background-color: #09071a; background: #09071a linear-gradient(#09071a, #09071a) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 32px; text-align: left; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); color: #f8fafc !important;">
            
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 24px;">
              <img src="https://taskbridge.ai/logo.png" alt="TaskBridge Logo" style="height: 36px; width: auto; display: inline-block; vertical-align: middle;" />
            </div>

            <!-- Content Area -->
            <div style="color: #cbd5e1 !important;">
              ${contentHtml}
            </div>

            <!-- Divider -->
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 32px 0 24px 0;" />

            <!-- Footer -->
            <div style="text-align: center; color: #64748b !important; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; color: #64748b !important;">&copy; ${currentYear} TaskBridge Systems. All rights reserved.</p>
              <p style="margin: 0 0 8px 0; color: #64748b !important;">Automating customer support through intelligent conversations.</p>
              <p style="margin: 0; color: #64748b !important;">You are receiving this transaction email because of activity associated with your account on <a href="https://taskbridge.ai" style="color: #a78bfa !important; text-decoration: none; font-weight: 500;">taskbridge.ai</a>.</p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Contact Inquiry Email
export function renderContactEmail(data: { name: string; email: string; company: string; message: string }): string {
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">New Inquiry Received</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      You have received a new contact submission from the TaskBridge website form. Here are the details:
    </p>
    
    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Sender Name:</strong> 
        <span style="color: #f8fafc;">${data.name}</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Work Email:</strong> 
        <span style="color: #f8fafc;"><a href="mailto:${data.email}" style="color: #8b5cf6; text-decoration: none;">${data.email}</a></span>
      </div>
      <div style="margin-bottom: 0; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Company Name:</strong> 
        <span style="color: #f8fafc;">${data.company}</span>
      </div>
    </div>

    <h2 style="color: #f8fafc; font-size: 14px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; tracking: 0.05em;">Message</h2>
    <div style="background-color: #14112e !important; background: #14112e linear-gradient(#14112e, #14112e) !important; border-left: 3px solid #8b5cf6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13.5px; line-height: 1.6; color: #cbd5e1 !important; white-space: pre-wrap;">${data.message}</div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://taskbridge.ai/admin" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Open Admin Dashboard</a>
    </div>
  `;
  return wrapBaseLayout(`New Inquiry: ${data.name}`, content);
}

// 2. Onboarding Notification Email
export function renderOnboardingEmail(data: {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  websiteUrl?: string;
  description: string;
  referralCode?: string;
  plan?: string;
}): string {
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">New Onboarding Request</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      A business has requested self-service onboarding. The setup is pending in the administrator queue.
    </p>

    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Business Name:</strong> 
        <span style="color: #f8fafc; font-weight: bold;">${data.businessName}</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Owner Name:</strong> 
        <span style="color: #f8fafc;">${data.ownerName}</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Selected Plan:</strong> 
        <span style="color: #f8fafc; font-weight: bold; text-transform: capitalize;">${data.plan || "Professional"}</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">WhatsApp Phone:</strong> 
        <span style="color: #f8fafc;"><a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="color: #8b5cf6; text-decoration: none;">${data.phone}</a></span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Email Address:</strong> 
        <span style="color: #f8fafc;"><a href="mailto:${data.email}" style="color: #8b5cf6; text-decoration: none;">${data.email}</a></span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Website:</strong> 
        <span style="color: #f8fafc;">${data.websiteUrl ? `<a href="${data.websiteUrl}" target="_blank" style="color: #8b5cf6; text-decoration: none;">${data.websiteUrl}</a>` : "Not provided"}</span>
      </div>
      <div style="margin-bottom: 0; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 130px; display: inline-block;">Referral Code:</strong> 
        <span style="color: #a78bfa !important; font-family: monospace; font-weight: bold; background-color: #1a153b !important; background: #1a153b linear-gradient(#1a153b, #1a153b) !important; padding: 2px 6px; border-radius: 4px;">${data.referralCode || "Direct"}</span>
      </div>
    </div>

    <h2 style="color: #f8fafc; font-size: 14px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; tracking: 0.05em;">Business Description</h2>
    <div style="background-color: #0f0c24 !important; background: #0f0c24 linear-gradient(#0f0c24, #0f0c24) !important; border: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13.5px; line-height: 1.6; color: #cbd5e1 !important; white-space: pre-wrap;">${data.description}</div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://replyiq.cv/admin" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Go to Admin Queue</a>
    </div>
  `;
  return wrapBaseLayout(`New Onboard Lead: ${data.businessName}`, content);
}

// 3. Ambassador Welcome Email
export function renderAmbassadorWelcomeEmail(data: { name: string; referralCode: string }): string {
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Welcome to the TaskBridge Campus Partner Program!</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi ${data.name},
    </p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Thank you for registering as a Campus Partner Ambassador. We are excited to have you represent TaskBridge at your university! Your ambassador account is now live, and you can start sharing your referral links to earn commissions.
    </p>

    <div style="background-color: #14112e !important; background: #14112e linear-gradient(#14112e, #14112e) !important; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; font-family: sans-serif; color: #f8fafc !important;">
      <div style="font-size: 11px; text-transform: uppercase; color: #a78bfa; tracking: 0.1em; margin-bottom: 8px; font-weight: bold;">Your Unique Referral Code</div>
      <div style="font-size: 24px; font-weight: 800; color: #ffffff; font-family: monospace; letter-spacing: 2px; margin-bottom: 16px;">${data.referralCode}</div>
      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
        Share this code directly or send business leads to your referral link:<br />
        <a href="https://replyiq.cv/onboard?ref=${data.referralCode}" style="color: #a78bfa; text-decoration: underline; font-weight: bold; display: inline-block; margin-top: 8px;">https://replyiq.cv/onboard?ref=${data.referralCode}</a>
      </div>
    </div>

    <h2 style="color: #f8fafc; font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">Program Earning Tiers</h2>
    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #cbd5e1 !important;">
      <ul style="margin: 0; padding-left: 20px; space-y: 8px;">
        <li><strong>Tier 1 (1 Paying Lead):</strong> Earn ₦1,500 cash reward.</li>
        <li><strong>Tier 2 (3 Paying Leads):</strong> Earn free personal setup.</li>
        <li><strong>Tier 3 (5 Paying Leads):</strong> Official Partner (₦2,000 commission per business).</li>
        <li><strong>Tier 4 (10 Paying Leads):</strong> Senior Partner (₦2,500 commission per business).</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://replyiq.cv/partners/login" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Access Ambassador Dashboard</a>
    </div>
  `;
  return wrapBaseLayout("Welcome to the TaskBridge Campus Partner Program", content);
}

// 4. AI Live / Setup Completed Notification
export function renderAiLiveEmail(data: { name: string; businessId: string }): string {
  const directLink = `https://replyiq.cv/c/${data.businessId}`;
  const widgetLink = `https://replyiq.cv/widget/${data.businessId}`;
  
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Your AI Assistant is Ready!</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi ${data.name},
    </p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Great news! Our team has finished setting up and configuring your AI Assistant. It is now live, trained, and ready to interact with your customers.
    </p>

    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Access Links</h3>
      
      <div style="margin-bottom: 16px;">
        <strong style="color: #a78bfa; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">Direct Customer Chat Link:</strong>
        <a href="${directLink}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600; word-break: break-all;">${directLink}</a>
        <span style="font-size: 12px; color: #64748b; display: block; margin-top: 2px;">Share this link directly on social media, WhatsApp, or Linktree.</span>
      </div>

      <div>
        <strong style="color: #a78bfa; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">Widget Integration Embed URL:</strong>
        <a href="${widgetLink}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600; word-break: break-all;">${widgetLink}</a>
        <span style="font-size: 12px; color: #64748b; display: block; margin-top: 2px;">Use this URL to load the chat inside an iframe directly on your site.</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${directLink}" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Test Your Assistant Now</a>
    </div>
  `;
  return wrapBaseLayout("Your TaskBridge AI Assistant is Ready", content);
}

// 5. Payment Installment Balance Reminder Email
export function renderInstallmentReminderEmail(data: {
  name: string;
  plan: string;
  paidCount: number;
  maxCount: number;
  paidAmount: number;
  balanceAmount: number;
}): string {
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Weekly Payment Reminder</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi ${data.name},
    </p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      This is a friendly weekly update regarding the installment payment plan for your TaskBridge AI assistant. Here is your current balance statement:
    </p>

    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 150px; display: inline-block;">Chosen Plan:</strong> 
        <span style="color: #f8fafc; font-weight: bold;">${data.plan}</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 150px; display: inline-block;">Installments Cleared:</strong> 
        <span style="color: #f8fafc;">${data.paidCount} of ${data.maxCount} paid</span>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 150px; display: inline-block;">Total Paid:</strong> 
        <span style="color: #10b981; font-weight: bold;">₦${data.paidAmount.toLocaleString()}</span>
      </div>
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 12px; font-size: 14px;">
        <strong style="color: #a78bfa; width: 150px; display: inline-block;">Remaining Balance:</strong> 
        <span style="color: #ef4444; font-weight: bold; font-size: 16px;">₦${data.balanceAmount.toLocaleString()}</span>
      </div>
    </div>

    <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
      To make payments or if you have any questions, please contact our support desk directly at <a href="mailto:support@replyiq.cv" style="color: #a78bfa; text-decoration: none; font-weight: 500;">support@replyiq.cv</a> or message us via WhatsApp.
    </p>

    <div style="text-align: center; margin-top: 32px;">
      <a href="mailto:support@replyiq.cv?subject=Payment%20Reference:%20${encodeURIComponent(data.name)}" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Contact Billing Support</a>
    </div>
  `;
  return wrapBaseLayout(`TaskBridge Installment Balance Update: ${data.name}`, content);
}

// 6. Generic Newsletter Wrapper
export function renderNewsletterEmail(subject: string, contentHtml: string): string {
  // Return the base wrapping layout directly around the customized markdown-converted HTML
  return wrapBaseLayout(subject, `
    <h1 style="color: #a78bfa; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 24px; font-family: sans-serif; text-align: center;">${subject}</h1>
    <div style="color: #cbd5e1; font-size: 14.5px; line-height: 1.7; font-family: sans-serif;">
      ${contentHtml}
    </div>
  `);
}

// 7. Business Activation Email (with credentials)
export function renderBusinessActivationEmail(data: { name: string; businessId: string; email: string; passwordStr: string }): string {
  const directLink = `https://replyiq.cv/c/${data.businessId}`;
  const widgetLink = `https://replyiq.cv/widget/${data.businessId}`;
  const dashboardLink = `https://replyiq.cv/login`;
  
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Welcome to TaskBridge - Your Assistant is Live!</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi ${data.name},
    </p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Great news! Your AI assistant for <strong>${data.name}</strong> has been activated and is ready to work. We have generated your business dashboard portal credentials below.
    </p>

    <!-- Dashboard Credentials Box -->
    <div style="background-color: #14112e !important; background: #14112e linear-gradient(#14112e, #14112e) !important; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">Your Dashboard Portal Access</h3>
      
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Portal Link:</strong>
        <a href="${dashboardLink}" target="_blank" style="color: #8b5cf6; text-decoration: underline; font-weight: bold;">${dashboardLink}</a>
      </div>
      <div style="margin-bottom: 12px; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Login Email:</strong>
        <span style="color: #ffffff; font-family: monospace; font-weight: bold;">${data.email}</span>
      </div>
      <div style="margin-bottom: 0; font-size: 13.5px;">
        <strong style="color: #a78bfa; width: 120px; display: inline-block;">Password:</strong>
        <span style="color: #ffffff; font-family: monospace; font-weight: bold; background-color: #1e1b4b !important; background: #1e1b4b linear-gradient(#1e1b4b, #1e1b4b) !important; padding: 2px 8px; border-radius: 4px;">${data.passwordStr}</span>
      </div>
      <div style="font-size: 11.5px; color: #94a3b8; margin-top: 14px; line-height: 1.4;">
        * You can change your password at any time in the Account Settings section inside your dashboard.
      </div>
    </div>

    <!-- Integration Details Box -->
    <div style="background-color: #120f26 !important; background: #120f26 linear-gradient(#120f26, #120f26) !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: sans-serif; color: #f8fafc !important;">
      <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">AI Assistant Links</h3>
      
      <div style="margin-bottom: 16px;">
        <strong style="color: #a78bfa; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">Direct Customer Chat Link:</strong>
        <a href="${directLink}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600; word-break: break-all;">${directLink}</a>
        <span style="font-size: 12px; color: #64748b; display: block; margin-top: 2px;">Share this link directly on social media, WhatsApp, or Linktree.</span>
      </div>

      <div>
        <strong style="color: #a78bfa; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">Widget Integration Embed URL:</strong>
        <a href="${widgetLink}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600; word-break: break-all;">${widgetLink}</a>
        <span style="font-size: 12px; color: #64748b; display: block; margin-top: 2px;">Use this URL to load the chat inside an iframe directly on your site.</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${dashboardLink}" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Access Your Dashboard</a>
    </div>
  `;
  return wrapBaseLayout("Your TaskBridge Business Portal Credentials", content);
}

// 8. Password Reset Email
export function renderPasswordResetEmail(data: { name: string; resetLink: string }): string {
  const content = `
    <h1 style="color: #a78bfa; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Reset Your Password</h1>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi ${data.name},
    </p>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      We received a request to reset the password for your TaskBridge account. Click the button below to choose a new password. This reset link is valid for <strong>1 hour</strong>.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.resetLink}" style="background-color: #8b5cf6 !important; background: #8b5cf6 linear-gradient(#8b5cf6, #8b5cf6) !important; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">Reset My Password</a>
    </div>

    <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin-bottom: 24px;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    
    <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 24px 0;" />
    
    <p style="color: #64748b; font-size: 11px; word-break: break-all; line-height: 1.4;">
      If the button above does not work, copy and paste this URL into your browser:<br />
      <a href="${data.resetLink}" style="color: #a78bfa !important;">${data.resetLink}</a>
    </p>
  `;
  return wrapBaseLayout("Reset Your TaskBridge Password", content);
}

// Helper to clean up JSON escape characters and ensure TaskBridge link exists
export function cleanPlainOutreachText(body: string, leadId: string): string {
  if (!body) return "";

  let cleaned = body;

  // 1. Clean up common JSON escaping artifacts
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\\t/g, " ");
  cleaned = cleaned.replace(/\\\\/g, "\\");

  // Remove any leading/trailing spaces/newlines
  cleaned = cleaned.trim();

  // 2. Normalize and ensure TaskBridge link exists
  const targetLink = `https://replyiq.cv/?utm_source=cold_outreach&lead_id=${leadId}`;
  
  // Look for any existing replyiq.cv link pattern
  // Exclude brackets and parentheses from the URL match so we don't break markdown or surrounding text
  const linkRegex = /https?:\/\/(www\.)?replyiq\.cv[^\s"'>()\[\]{}]*/gi;
  
  if (linkRegex.test(cleaned)) {
    // If a TaskBridge link exists, normalize all occurrences to our targetLink
    cleaned = cleaned.replace(linkRegex, targetLink);
  } else {
    // If no TaskBridge link exists, append it to the end of the body
    cleaned += `\n\nCheck out how it works here: ${targetLink}`;
  }

  return cleaned;
}

// Helper to convert clean plain text outreach body to HTML, supporting simple markdown (bold, links) and clickable raw URLs
export function formatOutreachBodyToHtml(body: string, leadId: string): string {
  // First clean it to ensure it's standardized
  let cleaned = cleanPlainOutreachText(body, leadId);

  // Convert markdown bold (**text**) to HTML strong
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert markdown links [text](url) to HTML anchor
  cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">$1</a>');

  // Convert raw URLs (excluding those already in href attributes or already wrapped in HTML anchor tags) to clickable anchors
  cleaned = cleaned.replace(/(?<!href=")(?<!">)(https?:\/\/[^\s<()\[\]{}]+)/g, (url) => {
    let cleanUrl = url;
    let trailing = "";
    const match = url.match(/[.,;:?]+$/);
    if (match) {
      cleanUrl = url.substring(0, url.length - match[0].length);
      trailing = match[0];
    }
    return `<a href="${cleanUrl}" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">${cleanUrl}</a>` + trailing;
  });

  // Convert newlines to <br />
  cleaned = cleaned.replace(/\r?\n/g, "<br />");

  return cleaned;
}

// 9. Cold Outbound Email Template (White background with dark branded logo header)
export function renderColdOutboundEmail(data: { subject: string; body: string; leadId?: string }): string {
  const formattedHtmlBody = formatOutreachBodyToHtml(data.body, data.leadId || "");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; color: #333333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Logo Header (Branded Dark Background) -->
          <div style="background-color: #030014; padding: 24px; text-align: center; border-bottom: 1px solid #1a153b;">
            <img src="https://replyiq.cv/logo.png" alt="TaskBridge Logo" style="height: 36px; width: auto; display: inline-block; vertical-align: middle;" />
          </div>

          <!-- Content Area (Clean White Background) -->
          <div style="padding: 32px 24px; color: #333333;">
            <div style="font-size: 15px; line-height: 1.7; color: #333333;">${formattedHtmlBody}</div>
            
            <!-- Divider -->
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 32px 0 24px 0;" />

            <!-- Signature -->
            <div style="font-size: 14px; color: #555555;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #111111;">Unity Ekeoba</p>
              <p style="margin: 0 0 12px 0; color: #666666;">Founder, TaskBridge</p>
              <p style="margin: 0; font-size: 13px;">
                <a href="https://replyiq.cv" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">replyiq.cv</a>
              </p>
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
}


