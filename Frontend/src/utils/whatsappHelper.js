export const OWNER_WHATSAPP_NUMBER = import.meta.env.VITE_OWNER_WHATSAPP || '919313729507';

/**
 * Formats a clean WhatsApp Web / App link for sending messages to owner
 */
export function createWhatsAppUrl(messageText, phoneNumber = OWNER_WHATSAPP_NUMBER) {
  const cleanPhone = String(phoneNumber).replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * 🛍️ Format New Order Notification for WhatsApp
 */
export function formatOrderWhatsAppMessage(order) {
  const orderId = order.orderNumber || order._id || 'HKK-NEW';
  const customerName = order.shippingAddress?.fullName || order.customerName || 'Customer';
  const customerPhone = order.shippingAddress?.phone || order.customerPhone || 'N/A';
  const paymentMethod = order.paymentMethod?.toUpperCase() || 'COD';
  const totalAmount = order.totalAmount || order.grandTotal || 0;

  const itemsList = (order.items || [])
    .map((item, idx) => `${idx + 1}. ${item.productName || item.title || 'Product'} (x${item.quantity || 1}) - ₹${item.price || 0}`)
    .join('\n');

  const fullAddress = order.shippingAddress
    ? `${order.shippingAddress.addressLine1 || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}`
    : 'Address attached in order details';

  return `🛍️ *NEW ORDER RECEIVED #${orderId}*

👤 *Customer Name:* ${customerName}
📞 *Phone Number:* ${customerPhone}
💳 *Payment Method:* ${paymentMethod}
💰 *Total Amount:* ₹${totalAmount}

🛒 *Ordered Items:*
${itemsList || 'Items listed in portal'}

📍 *Shipping Address:*
${fullAddress}

---
*Sent via Hath Ki Kala Online Store*`;
}

/**
 * ✨ Format Customization Request for WhatsApp
 */
export function formatCustomizationWhatsAppMessage(req) {
  const customerName = req.customerName || 'Customer';
  const customerPhone = req.customerPhone || 'N/A';
  const productName = req.productName || 'Handcrafted Custom Item';

  return `✨ *NEW BESPOKE CUSTOMIZATION REQUEST*

👤 *Customer Name:* ${customerName}
📞 *Phone Number:* ${customerPhone}
🎨 *Target Product:* ${productName}
📏 *Custom Specifications / Requirements:*
${req.requirements || req.notes || 'Custom size & design preference'}

---
*Sent via Hath Ki Kala Customization Studio*`;
}

/**
 * 📩 Format Support Enquiry / Ticket for WhatsApp
 */
export function formatSupportWhatsAppMessage(ticket) {
  const name = ticket.customerName || ticket.name || 'Customer';
  const phone = ticket.phone || 'N/A';
  const subject = ticket.subject || 'Store Enquiry';
  const message = ticket.message || 'I have a question regarding an order/product.';

  return `📩 *NEW STORE ENQUIRY / SUPPORT TICKET*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📌 *Subject:* ${subject}
📝 *Message:*
"${message}"

---
*Sent via Hath Ki Kala Help Center*`;
}

/**
 * 💬 Format Unanswered Chat Question for WhatsApp
 */
export function formatChatQueryWhatsAppMessage(queryText, customerName = 'Customer') {
  return `💬 *CUSTOMER CHAT ENQUIRY*

👤 *Customer Name:* ${customerName}
❓ *Question Asked:*
"${queryText}"

---
*Forwarded from Hath Ki Kala Live Chat Widget*`;
}
