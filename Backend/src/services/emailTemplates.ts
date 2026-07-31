// Beautiful, responsive HTML email templates for Hath Ki Kala

const baseLayout = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAF6F0; margin: 0; padding: 0; color: #2D2D2D; }
    .container { max-width: 600px; margin: 30px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #EFE7DD; box-shadow: 0 10px 25px rgba(201, 124, 93, 0.08); }
    .header { background: linear-gradient(135deg, #C97C5D 0%, #D8A7B1 100%); padding: 35px 30px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 35px 30px; line-height: 1.6; font-size: 14px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #C97C5D; color: #FFFFFF !important; text-decoration: none; font-weight: bold; border-radius: 14px; margin: 20px 0; font-size: 14px; text-align: center; shadow: 0 4px 12px rgba(201, 124, 93, 0.3); }
    .otp-code { display: inline-block; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C97C5D; background: #FFF0EC; padding: 12px 28px; border-radius: 16px; border: 2px dashed #C97C5D; margin: 15px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table th { background: #FAF6F0; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #777; border-bottom: 2px solid #EFE7DD; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #F5EFE6; }
    .summary-card { background: #FAF6F0; border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid #EFE7DD; }
    .footer { background: #FAF6F0; padding: 25px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #EFE7DD; }
    .footer a { color: #C97C5D; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 Hath Ki Kala</h1>
      <p>Artisanal Handmade Crafts & Fine Goods</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>Made with love by traditional Indian artisans 💕</p>
      <p>© ${new Date().getFullYear()} Hath Ki Kala. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export function getVerificationEmailHtml({ name, otp }: { name: string; otp: string }) {
  const content = `
    <h2 style="color: #2D2D2D; margin-top: 0;">Verify Your Email Address ✉️</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for joining <strong>Hath Ki Kala</strong>! Please enter the One-Time Password (OTP) below to verify your account:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <p style="font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
        👇 Tap or click code below to select & copy
      </p>
      
      <div 
        style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #C97C5D; background: #FFF0EC; padding: 14px 28px; border-radius: 20px; border: 2.5px dashed #C97C5D; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; cursor: pointer;"
        title="Tap to select OTP"
      >
        ${otp}
      </div>

      <p style="font-size: 11px; color: #999; margin-top: 10px; font-style: italic;">
        (Single tap highlights all 6 digits for instant copying)
      </p>
    </div>

    <p style="font-size: 12px; color: #777;">This OTP is valid for <strong>15 minutes</strong>. If you did not request this email, please ignore it.</p>
  `;
  return baseLayout('Email Verification - Hath Ki Kala', content);
}

export function getWelcomeEmailHtml({ name }: { name: string }) {
  const content = `
    <h2 style="color: #2D2D2D; margin-top: 0;">Welcome to Hath Ki Kala! 🌸</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We are thrilled to welcome you to our community of handcrafted art lovers! Every product at Hath Ki Kala is lovingly hand-stitched, woven, and crafted by master artisans across India.</p>
    <div class="summary-card">
      <h3 style="margin-top:0; color:#C97C5D;">What you can explore:</h3>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li>✨ Exclusive Handmade Crochet Plushies & Keychains</li>
        <li>✨ Ethnic Embroidered Blouses & Mirror Work Accessories</li>
        <li>✨ Artisan Bangles & Handmade Jewel Hampers</li>
      </ul>
    </div>
    <div style="text-align: center;">
      <a href="http://localhost:5174" class="btn">Explore Our Catalog Now</a>
    </div>
    <p>If you have any questions or custom order requests, reply to this email or reach out anytime!</p>
  `;
  return baseLayout('Welcome to Hath Ki Kala!', content);
}

export function getPasswordResetEmailHtml({ name, resetUrl }: { name: string; resetUrl: string }) {
  const content = `
    <h2 style="color: #2D2D2D; margin-top: 0;">Password Reset Request 🔐</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your Hath Ki Kala account. Click the button below to set a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #777;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #C97C5D;">${resetUrl}</a></p>
    <p style="font-size: 12px; color: #777;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  return baseLayout('Password Reset - Hath Ki Kala', content);
}

export function getOrderConfirmationEmailHtml({ order }: { order: any }) {
  const itemsRows = order.items.map((it: any) => `
    <tr>
      <td><strong>${it.productName}</strong><br/><span style="font-size: 11px; color: #888;">SKU: ${it.variantSku}</span></td>
      <td style="text-align: center;">${it.quantity}</td>
      <td style="text-align: right;">₹${it.unitPrice}</td>
      <td style="text-align: right; font-weight: bold;">₹${it.lineTotal}</td>
    </tr>
  `).join('');

  const content = `
    <h2 style="color: #2D2D2D; margin-top: 0;">Order Confirmed! 🎉</h2>
    <p>Hello <strong>${order.shippingAddress?.fullName || 'Valued Customer'}</strong>,</p>
    <p>Thank you for your purchase! We have received your order <strong>#${order.id}</strong> and our artisans are preparing it with care.</p>
    
    <div class="summary-card">
      <h3 style="margin-top: 0; color: #C97C5D;">Order Summary (#${order.id})</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; line-height: 1.8;">
        <div>Subtotal: <strong>₹${order.subtotal}</strong></div>
        <div>Shipping Fee: <strong>₹${order.shippingFee || 0}</strong></div>
        <div style="font-size: 16px; font-weight: bold; color: #C97C5D; margin-top: 6px;">Grand Total: ₹${order.totalAmount}</div>
      </div>
    </div>

    <div class="summary-card">
      <h4 style="margin-top:0; color: #555;">Shipping Address</h4>
      <p style="margin:0; font-size: 13px;">
        ${order.shippingAddress?.fullName}<br/>
        ${order.shippingAddress?.line1} ${order.shippingAddress?.line2 || ''}<br/>
        ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}<br/>
        Phone: ${order.shippingAddress?.phone}
      </p>
    </div>

    <p style="font-size: 12px; color: #777;">Payment Method: <strong>${(order.payment?.provider || 'COD').toUpperCase()}</strong> (${order.payment?.status?.toUpperCase()})</p>
  `;
  return baseLayout(`Order Confirmed #${order.id} - Hath Ki Kala`, content);
}

export function getShippingUpdateEmailHtml({ order }: { order: any }) {
  const content = `
    <h2 style="color: #2D2D2D; margin-top: 0;">Your Order is On Its Way! 🚚💨</h2>
    <p>Hello <strong>${order.shippingAddress?.fullName || 'Valued Customer'}</strong>,</p>
    <p>Great news! Your order <strong>#${order.id}</strong> has been shipped and is on its way to you.</p>

    <div class="summary-card" style="border-left: 4px solid #C97C5D;">
      <h3 style="margin-top: 0; color: #C97C5D;">Tracking Details</h3>
      <p style="margin: 4px 0;">Courier Partner: <strong>${order.courierName || 'Standard Express'}</strong></p>
      <p style="margin: 4px 0;">AWB / Tracking Number: <strong style="font-family: monospace; font-size: 15px; color: #C97C5D;">${order.trackingNumber || 'N/A'}</strong></p>
    </div>

    <div style="text-align: center;">
      <a href="${order.trackingUrl || '#'}" class="btn">Track Package Status</a>
    </div>

    <p>Thank you for shopping with Hath Ki Kala!</p>
  `;
  return baseLayout(`Shipping Update #${order.id} - Hath Ki Kala`, content);
}
