const OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER || '919313729507';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || ''; // Optional free WhatsApp Bot API key

/**
 * Utility to format & dispatch WhatsApp notifications to store owner
 */
export async function sendOwnerWhatsAppNotification(eventTitle: string, messageBody: string) {
  const cleanPhone = OWNER_WHATSAPP_NUMBER.replace(/[^\d]/g, '');
  const fullText = `*HATH KI KALA STORE ALERT*\n\n*${eventTitle}*\n${messageBody}`;
  const whatsappWebUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`;

  console.log(`\n==================================================`);
  console.log(`📱 [WHATSAPP DISPATCHER] ${eventTitle}`);
  console.log(`Target Phone: +${cleanPhone}`);
  console.log(`Message:\n${fullText}`);
  console.log(`WhatsApp Link: ${whatsappWebUrl}`);
  console.log(`==================================================\n`);

  // If CallMeBot or custom webhook key is configured, send automated HTTP message
  if (CALLMEBOT_API_KEY) {
    try {
      const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodeURIComponent(fullText)}&apikey=${CALLMEBOT_API_KEY}`;
      await fetch(apiUrl);
    } catch (err) {
      console.warn('CallMeBot WhatsApp dispatch note:', err);
    }
  }

  return { whatsappWebUrl, text: fullText };
}

/**
 * 1. 🛍️ Notify Owner on New Order Placement
 */
export async function notifyOwnerNewOrder(order: any) {
  const orderId = order.orderNumber || order._id?.toString() || 'HKK-NEW';
  const customerName = order.shippingAddress?.fullName || 'Customer';
  const customerPhone = order.shippingAddress?.phone || 'N/A';
  const paymentMethod = (order.paymentMethod || 'COD').toUpperCase();
  const grandTotal = order.grandTotal || order.totalAmount || 0;

  const itemsStr = (order.items || [])
    .map((item: any) => `- ${item.productName || 'Item'} (x${item.quantity || 1}) - ₹${item.price || 0}`)
    .join('\n');

  const message = `👤 Customer: ${customerName} (📞 ${customerPhone})\n💳 Payment: ${paymentMethod}\n💰 Total: ₹${grandTotal}\n\n🛒 Items:\n${itemsStr}`;
  return sendOwnerWhatsAppNotification(`🛍️ NEW ORDER #${orderId}`, message);
}

/**
 * 2. ✨ Notify Owner on Customization Request
 */
export async function notifyOwnerCustomizationRequest(req: any) {
  const name = req.customerName || 'Customer';
  const phone = req.customerPhone || 'N/A';
  const product = req.productName || 'Handcrafted Product';
  const details = req.requirements || req.notes || 'Custom specifications requested';

  const message = `👤 Customer: ${name}\n📞 Phone: ${phone}\n🎨 Target Product: ${product}\n\n📝 Details:\n${details}`;
  return sendOwnerWhatsAppNotification(`✨ NEW BESPOKE CUSTOMIZATION`, message);
}

/**
 * 3. 📩 Notify Owner on Support Enquiry / Ticket
 */
export async function notifyOwnerSupportTicket(ticket: any) {
  const name = ticket.customerName || ticket.name || 'Customer';
  const phone = ticket.phone || 'N/A';
  const subject = ticket.subject || 'General Enquiry';
  const msg = ticket.message || 'Customer submitted an enquiry.';

  const message = `👤 Name: ${name}\n📞 Phone: ${phone}\n📌 Subject: ${subject}\n\n💬 Message:\n"${msg}"`;
  return sendOwnerWhatsAppNotification(`📩 NEW SUPPORT TICKET`, message);
}

/**
 * 4. 💬 Notify Owner on Unanswered Chat Question
 */
export async function notifyOwnerChatQuestion(chatQuery: any) {
  const name = chatQuery.customerName || 'Customer';
  const phone = chatQuery.customerPhone || 'N/A';
  const text = chatQuery.questionText || 'Customer asked a question.';

  const message = `👤 Customer: ${name}\n📞 Phone: ${phone}\n\n❓ Question:\n"${text}"`;
  return sendOwnerWhatsAppNotification(`💬 NEW CHAT ENQUIRY`, message);
}
