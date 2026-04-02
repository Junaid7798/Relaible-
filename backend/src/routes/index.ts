import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole, requireOwner } from '../middleware/rbac';
import { validateBody, validateQuery } from '../middleware/validate';
import { AuthController } from '../controllers/auth.controller';
import { PartyController } from '../controllers/party.controller';
import { OrderController } from '../controllers/order.controller';
import { PaymentController, LedgerController, InvoiceController } from '../controllers/payment.controller';
import { TripController, StockController, ExpenseController, StaffController, CashClosingController } from '../controllers/operations.controller';
import { loginSchema, createUserSchema, createPartySchema, updatePartySchema, createOrderSchema, createPaymentSchema, createExpenseSchema, createStaffSchema, markAttendanceSchema, giveAdvanceSchema, createTripSchema, updateTripStatusSchema, stockMovementSchema, createCashClosingSchema } from '../validation/schemas';

const router = Router();

// Auth
router.post('/auth/login', validateBody(loginSchema), AuthController.login);
router.post('/auth/register', authenticate, requireOwner, validateBody(createUserSchema), AuthController.register);
router.post('/auth/refresh', AuthController.refreshToken);
router.post('/auth/change-password', authenticate, AuthController.changePassword);
router.get('/auth/users', authenticate, AuthController.getUsers);

// Parties
router.post('/parties', authenticate, validateBody(createPartySchema), PartyController.create);
router.get('/parties', authenticate, PartyController.getAll);
router.get('/parties/top', authenticate, PartyController.getTop);
router.get('/parties/:id', authenticate, PartyController.getById);
router.put('/parties/:id', authenticate, validateBody(updatePartySchema), PartyController.update);
router.delete('/parties/:id', authenticate, requireOwner, PartyController.delete);
router.post('/parties/communications', authenticate, PartyController.addCommunication);
router.post('/parties/addresses', authenticate, PartyController.addAddress);
router.post('/parties/rates', authenticate, PartyController.setRate);

// Orders
router.post('/orders', authenticate, validateBody(createOrderSchema), OrderController.create);
router.get('/orders', authenticate, OrderController.getAll);
router.get('/orders/:id', authenticate, OrderController.getById);
router.patch('/orders/:id/status', authenticate, OrderController.updateStatus);
router.delete('/orders/:id', authenticate, requireOwner, OrderController.delete);

// Payments
router.post('/payments', authenticate, validateBody(createPaymentSchema), PaymentController.create);
router.get('/payments', authenticate, PaymentController.getAll);
router.delete('/payments/:id', authenticate, requireOwner, PaymentController.delete);

// Ledger
router.get('/ledger/:partyId', authenticate, LedgerController.getPartyLedger);
router.get('/ledger-outstanding', authenticate, LedgerController.getTotalOutstanding);
router.get('/follow-up-list', authenticate, LedgerController.getFollowUpList);
router.post('/ledger/recalculate', authenticate, requireOwner, LedgerController.recalculate);

// Invoices
router.post('/invoices/generate', authenticate, InvoiceController.generate);
router.get('/invoices/order/:orderId', authenticate, InvoiceController.getByOrder);
router.get('/invoices', authenticate, InvoiceController.getAll);

// Trips
router.post('/trips', authenticate, validateBody(createTripSchema), TripController.create);
router.patch('/trips/:id/status', authenticate, validateBody(updateTripStatusSchema), TripController.updateStatus);
router.get('/trips/my', authenticate, requireRole('DRIVER'), TripController.getMyTrips);
router.get('/trips/active', authenticate, TripController.getActive);
router.get('/trips/stats', authenticate, TripController.getStats);

// Stock
router.post('/stock/movements', authenticate, validateBody(stockMovementSchema), StockController.createMovement);
router.get('/stock/current', authenticate, StockController.getCurrent);
router.get('/stock/today', authenticate, StockController.getToday);

// Expenses
router.post('/expenses', authenticate, validateBody(createExpenseSchema), ExpenseController.create);
router.get('/expenses', authenticate, ExpenseController.getAll);
router.get('/expenses/summary', authenticate, ExpenseController.getSummary);
router.delete('/expenses/:id', authenticate, requireOwner, ExpenseController.delete);

// Staff
router.post('/staff', authenticate, requireRole('OWNER','PLANT_MANAGER','SHOP_MANAGER'), validateBody(createStaffSchema), StaffController.create);
router.get('/staff', authenticate, StaffController.getAll);
router.post('/staff/attendance', authenticate, validateBody(markAttendanceSchema), StaffController.markAttendance);
router.get('/staff/attendance', authenticate, StaffController.getAttendance);
router.post('/staff/advances', authenticate, validateBody(giveAdvanceSchema), StaffController.giveAdvance);
router.get('/staff/payroll', authenticate, StaffController.getPayroll);

// Cash Closing
router.get('/cash-closing/expected', authenticate, CashClosingController.calculateExpected);
router.post('/cash-closing', authenticate, validateBody(createCashClosingSchema), CashClosingController.create);
router.get('/cash-closing', authenticate, CashClosingController.getAll);
router.get('/cash-closing/status', authenticate, CashClosingController.getStatus);

// Health
router.get('/health', async (_req, res) => {
  const { healthCheck } = await import('../config/database');
  const ok = await healthCheck();
  res.status(ok ? 200 : 503).json({ status: ok ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() });
});

export default router;