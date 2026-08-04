import type { Request, Response } from 'express';
import ChatQuestion, { type IChatQuestion } from '../models/ChatQuestion.js';
import UnansweredQuestion from '../models/UnansweredQuestion.js';
import SiteSetting from '../models/SiteSetting.js';
import { AppError } from '../utils/AppError.js';
import { notifyOwnerChatQuestion } from '../services/whatsappService.js';

const SEED_QUESTIONS = [
  // Orders & Delivery
  {
    category: 'Orders & Delivery',
    question: 'Do you deliver Pan India?',
    answer: 'Yes! We deliver handcrafted happiness to every pincode across Pan-India with free shipping on orders over ₹999.',
    isFeatured: true,
    orderPosition: 1,
  },
  {
    category: 'Orders & Delivery',
    question: 'How long does delivery take?',
    answer: 'In-stock items ship within 24-48 hours. Custom/made-to-order items take 3-7 days for handcrafting before dispatch.',
    isFeatured: false,
    orderPosition: 2,
  },
  {
    category: 'Orders & Delivery',
    question: 'How can I track my order?',
    answer: 'You can track your live production status and delivery courier on our Track Order page (/track-order) using your Order ID and Phone Number.',
    isFeatured: true,
    orderPosition: 3,
  },
  {
    category: 'Orders & Delivery',
    question: 'Can I cancel my order after placing it?',
    answer: 'Orders can be cancelled while status is Placed or Confirmed. Once status is In Production, crafting has begun and cannot be cancelled.',
    isFeatured: false,
    orderPosition: 4,
  },
  {
    category: 'Orders & Delivery',
    question: 'What if my order arrives damaged?',
    answer: 'We take utmost care in packaging! If damaged upon receipt, message us on WhatsApp with photos within 24 hours for a free replacement.',
    isFeatured: false,
    orderPosition: 5,
  },

  // Customization
  {
    category: 'Customization',
    question: 'Can I customize a product (color, size, design)?',
    answer: 'Yes! We specialize in custom color combinations, sizes, and embroidered initials for bangles, blouses, purses & scrunchies.',
    isFeatured: true,
    orderPosition: 1,
  },
  {
    category: 'Customization',
    question: 'Are customization charges extra?',
    answer: 'Minor color/size tweaks are complimentary! Major custom design changes carry a small extra fee reviewed by our artisan team.',
    isFeatured: false,
    orderPosition: 2,
  },
  {
    category: 'Customization',
    question: 'How long does a customized order take?',
    answer: 'Customized items typically take 4-7 business days to craft with love before dispatch.',
    isFeatured: false,
    orderPosition: 3,
  },

  // Pricing & Payment
  {
    category: 'Pricing & Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI (GPay, PhonePe, Paytm, BHIM QR), Credit/Debit Cards, NetBanking via Cashfree, and Cash on Delivery (COD).',
    isFeatured: true,
    orderPosition: 1,
  },
  {
    category: 'Pricing & Payment',
    question: 'Do you offer discounts on bulk/multiple items?',
    answer: 'Yes! Use coupon FESTIVE10 for 10% off. For wedding or corporate bulk orders, contact us directly for custom bulk pricing.',
    isFeatured: false,
    orderPosition: 2,
  },
  {
    category: 'Pricing & Payment',
    question: 'Is Cash on Delivery available?',
    answer: 'Yes, Cash on Delivery (COD) is available across most pincodes in India.',
    isFeatured: false,
    orderPosition: 3,
  },

  // Product & Stock
  {
    category: 'Product & Stock',
    question: 'Is this product handmade?',
    answer: '100% Yes! Every product is authentically handcrafted by skilled Indian artisans using premium yarn, silk, and mirror work.',
    isFeatured: true,
    orderPosition: 1,
  },
  {
    category: 'Product & Stock',
    question: 'What if the product I want is out of stock?',
    answer: 'You can add it to your Wishlist to get notified when restocked, or message us on WhatsApp for a custom order.',
    isFeatured: false,
    orderPosition: 2,
  },
  {
    category: 'Product & Stock',
    question: 'Do you restock sold-out items?',
    answer: 'Yes, popular handcrafted items are restocked regularly every 1-2 weeks.',
    isFeatured: false,
    orderPosition: 3,
  },

  // Returns & Support
  {
    category: 'Returns & Support',
    question: 'What is your return/exchange policy?',
    answer: 'Due to the handmade nature of our products, we offer free replacements for damaged items. Custom orders are final sale.',
    isFeatured: true,
    orderPosition: 1,
  },
  {
    category: 'Returns & Support',
    question: 'How do I contact you directly?',
    answer: 'You can reach us on WhatsApp at +91 9313729507 or email us at support@hathkikala.com.',
    isFeatured: false,
    orderPosition: 2,
  },
  {
    category: 'Returns & Support',
    question: 'Do you take custom/bulk orders for weddings or events?',
    answer: 'Yes! We specialize in handcrafted return gifts, bridal hampers, bangles, and festive favors for weddings and events.',
    isFeatured: true,
    orderPosition: 3,
  },
];

// GET /api/chat/questions - Public endpoint returning FAQ questions grouped by category
export async function getChatQuestions(req: Request, res: Response) {
  const count = await ChatQuestion.countDocuments();
  if (count === 0) {
    console.log('Seeding initial FAQ starter questions in MongoDB...');
    await ChatQuestion.insertMany(SEED_QUESTIONS);
  }

  const settings = await SiteSetting.findOne({ key: 'main' });

  const questions = await ChatQuestion.find({ isActive: true }).sort({
    isFeatured: -1,
    orderPosition: 1,
    createdAt: 1,
  });

  const categories = ['Orders & Delivery', 'Customization', 'Pricing & Payment', 'Product & Stock', 'Returns & Support'];
  const grouped: Record<string, typeof questions> = {};

  categories.forEach((cat) => {
    grouped[cat] = questions.filter((q) => q.category === cat);
  });

  return res.status(200).json({
    success: true,
    data: {
      questions,
      grouped,
      settings: {
        chatWidgetEnabled: settings?.chatWidgetEnabled ?? true,
        proactiveNudgeEnabled: settings?.proactiveNudgeEnabled ?? true,
        proactiveNudgeDelaySeconds: settings?.proactiveNudgeDelaySeconds ?? 8,
      },
    },
  });
}

// POST /api/chat/ask-unanswered - Log customer free-text query
export async function askUnansweredQuestion(req: Request, res: Response) {
  const { questionText, customerName, customerPhone, customerEmail } = req.body;

  if (!questionText || !questionText.trim()) {
    throw new AppError('Question text is required', 400);
  }

  const logged = await UnansweredQuestion.create({
    questionText: questionText.trim(),
    customerName: customerName || req.user?.name || 'Customer',
    customerPhone: customerPhone || req.user?.phone,
    customerEmail: customerEmail || req.user?.email,
    ...(req.user?._id ? { userId: req.user._id as any } : {}),
  });

  // Trigger WhatsApp notification to owner
  notifyOwnerChatQuestion(logged).catch((err) =>
    console.error('WhatsApp chat query notification error:', err)
  );

  return res.status(201).json({
    success: true,
    message: 'Your question has been forwarded to our artisan team! We will reply via WhatsApp/email shortly. ✨',
    data: { unansweredQuestion: logged },
  });
}

// GET /api/chat/admin/questions - Admin list all FAQ entries
export async function listChatQuestionsAdmin(req: Request, res: Response) {
  const questions = await ChatQuestion.find().sort({ category: 1, isFeatured: -1, orderPosition: 1 });
  return res.status(200).json({
    success: true,
    data: { questions },
  });
}

// POST /api/chat/admin/questions - Admin create FAQ question
export async function createChatQuestionAdmin(req: Request, res: Response) {
  const { category, question, answer, isFeatured, orderPosition } = req.body;

  if (!category || !question || !answer) {
    throw new AppError('Category, Question, and Answer are required', 400);
  }

  const created = await ChatQuestion.create({
    category,
    question: question.trim(),
    answer: answer.trim(),
    isFeatured: Boolean(isFeatured),
    orderPosition: Number(orderPosition) || 0,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    message: 'FAQ Question added successfully!',
    data: { question: created },
  });
}

// PATCH /api/chat/admin/questions/:id - Admin update FAQ question
export async function updateChatQuestionAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { category, question, answer, isFeatured, orderPosition, isActive } = req.body;

  const item = await ChatQuestion.findById(id);
  if (!item) {
    throw new AppError('FAQ Question not found', 404);
  }

  if (category) item.category = category;
  if (question !== undefined) item.question = question.trim();
  if (answer !== undefined) item.answer = answer.trim();
  if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);
  if (orderPosition !== undefined) item.orderPosition = Number(orderPosition);
  if (isActive !== undefined) item.isActive = Boolean(isActive);

  await item.save();

  return res.status(200).json({
    success: true,
    message: 'FAQ Question updated!',
    data: { question: item },
  });
}

// DELETE /api/chat/admin/questions/:id - Admin delete FAQ question
export async function deleteChatQuestionAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const item = await ChatQuestion.findByIdAndDelete(id);
  if (!item) {
    throw new AppError('FAQ Question not found', 404);
  }
  return res.status(200).json({ success: true, message: 'FAQ Question deleted' });
}

// GET /api/chat/admin/unanswered - Admin list unanswered questions
export async function listUnansweredQuestionsAdmin(req: Request, res: Response) {
  const items = await UnansweredQuestion.find().sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: { unansweredQuestions: items },
  });
}

// PATCH /api/chat/admin/unanswered/:id - Admin update unanswered question status
export async function updateUnansweredQuestionAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const item = await UnansweredQuestion.findById(id);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  if (status) item.status = status;
  if (adminNotes !== undefined) item.adminNotes = adminNotes;

  await item.save();

  return res.status(200).json({
    success: true,
    message: 'Unanswered Question status updated',
    data: { unansweredQuestion: item },
  });
}
