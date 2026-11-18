import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import * as subjects from '../controllers/subject.controller.js';
import * as tasks from '../controllers/task.controller.js';
import * as reports from '../controllers/report.controller.js';
import * as study from '../controllers/study.controller.js';
import * as aiChat from '../controllers/aiChat.controller.js';
import { verifyOrigin } from '../middleware/csrf.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/auth/refresh', verifyOrigin, auth.refresh);
router.post('/auth/logout', verifyOrigin, auth.logout);
router.post('/auth/register', registerLimiter, auth.register);
router.post('/auth/login', loginLimiter, auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);

router.use(requireAuth);
router.post('/ai/chat', aiChat.chat);
router.get('/subjects', subjects.list);
router.post('/subjects', subjects.create);
router.get('/subjects/:id', subjects.getOne);
router.put('/subjects/:id', subjects.update);
router.delete('/subjects/:id', subjects.remove);

router.get('/tasks', tasks.list);
router.post('/tasks', tasks.create);
router.get('/tasks/:id', tasks.getOne);
router.put('/tasks/:id', tasks.update);
router.delete('/tasks/:id', tasks.remove);

router.get('/study-sessions', study.listSessions);
router.post('/study-sessions', study.createSession);
router.post('/ai/study-plans/generate', study.generatePlan);
router.get('/study-plans', study.listPlans);
router.get('/dashboard/summary', study.dashboard);
router.get('/reports/summary', reports.getReportSummary);
export default router;
