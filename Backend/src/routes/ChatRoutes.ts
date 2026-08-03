import { Router } from 'express';
import {
  getChatQuestions,
  askUnansweredQuestion,
  listChatQuestionsAdmin,
  createChatQuestionAdmin,
  updateChatQuestionAdmin,
  deleteChatQuestionAdmin,
  listUnansweredQuestionsAdmin,
  updateUnansweredQuestionAdmin,
} from '../controllers/ChatController.js';
import { optionalProtect, protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public / Customer Endpoints
router.get('/questions', getChatQuestions);
router.post('/ask-unanswered', optionalProtect, askUnansweredQuestion);

// Protected Admin Endpoints
router.use(protect);
router.get('/admin/questions', restrictTo('admin'), listChatQuestionsAdmin);
router.post('/admin/questions', restrictTo('admin'), createChatQuestionAdmin);
router.patch('/admin/questions/:id', restrictTo('admin'), updateChatQuestionAdmin);
router.delete('/admin/questions/:id', restrictTo('admin'), deleteChatQuestionAdmin);

router.get('/admin/unanswered', restrictTo('admin'), listUnansweredQuestionsAdmin);
router.patch('/admin/unanswered/:id', restrictTo('admin'), updateUnansweredQuestionAdmin);

export default router;
