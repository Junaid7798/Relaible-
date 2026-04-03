import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole, requireOwner, requireMinRole, requireSiteAccess, requireAdmin } from '../middleware/rbac';
import { validateBody, validateQuery } from '../middleware/validate';
import { AuthController } from '../controllers/auth.controller';
import { PartyController } from '../controllers/party.controller';
import { OrderController } from '../controllers/order.controller';
import { PaymentController, LedgerController, InvoiceController } from '../controllers/payment.controller';
import { TripController, StockController, ExpenseController, StaffController, CashClosingController } from '../controllers/operations.controller';
import { loginSchema, createUserSchema, createPartySchema, updatePartySchema, createOrderSchema, createPaymentSchema, createExpenseSchema, createStaffSchema, markAttendanceSchema, giveAdvanceSchema, createTripSchema, updateTripStatusSchema, stockMovementSchema, createCashClosingSchema } from '../validation/schemas';

const router = Router();

// ============ PUBLIC ROUTES ============
// Auth - login
router.post('/auth/login', validateBody(loginSchema), AuthController.login);

// Invite validation (public - no auth needed)
router.get('/invites/:code', AuthController.validateInvite);

// Accept invite (public - no auth needed)
router.post('/invites/:code/accept', AuthController.acceptInvite);

// ============ AUTHENTICATED ROUTES ============
// Auth
router.post('/auth/register', authenticate, requireOwner, validateBody(createUserSchema), AuthController.register);
router.post('/auth/refresh', AuthController.refreshToken);
router.post('/auth/change-password', authenticate, AuthController.changePassword);
router.get('/auth/users', authenticate, AuthController.getUsers);

// Organization & Sites (owner only)
router.post('/auth/organization', authenticate, requireOwner, AuthController.createOrganization);
router.post('/auth/sites', authenticate, requireOwner, AuthController.createSite);
router.get('/auth/sites', authenticate, AuthController.getUserSites);

// Invites (owner/admin only)
router.post('/invites', authenticate, requireMinRole('admin'), AuthController.createInvite);

// Partner permissions (owner only)
router.patch('/users/:userId/permissions', authenticate, requireOwner, AuthController.updatePartnerPermissions);

// ============ ROLE-BASED ROUTES ============

// Parties (customers) - managed by owner/admin/site_manager
router.post('/parties', authenticate, requireMinRole('site_manager'), validateBody(createPartySchema), PartyController.create);
router.get('/parties', authenticate, PartyController.getAll);
router.get('/parties/top', authenticate, PartyController.getTop);
router.get('/parties/:id', authenticate, PartyController.getById);
router.put('/parties/:id', authenticate, requireMinRole('site_manager'), validateBody(updatePartySchema), PartyController.update);
router.delete('/parties/:id', authenticate, requireOwner, PartyController.delete);
router.post('/parties/communications', authenticate, requireMinRole('site_manager'), PartyController.addCommunication);
router.post('/parties/addresses', authenticate, requireMinRole('site_manager'), PartyController.addAddress);
router.post('/parties/rates', authenticate, requireMinRole('site_manager'), PartyController.setRate);

// Orders
router.post('/orders', authenticate, requireMinRole('site_manager'), validateBody(createOrderSchema), OrderController.create);
router.get('/orders', authenticate, OrderController.getAll);
router.get('/orders/:id', authenticate, OrderController.getById);
router.patch('/orders/:id/status', authenticate, requireMinRole('site_manager'), OrderController.updateStatus);
router.delete('/orders/:id', authenticate, requireOwner, OrderController.delete);

// Payments
router.post('/payments', authenticate, requireMinRole('site_manager'), validateBody(createPaymentSchema), PaymentController.create);
router.get('/payments', authenticate, PaymentController.getAll);
router.delete('/payments/:id', authenticate, requireOwner, PaymentController.delete);

// Ledger
router.get('/ledger/:partyId', authenticate, requireMinRole('site_manager'), LedgerController.getPartyLedger);
router.get('/ledger-outstanding', authenticate, requireMinRole('site_manager'), LedgerController.getTotalOutstanding);
router.get('/follow-up-list', authenticate, requireMinRole('site_manager'), LedgerController.getFollowUpList);
router.post('/ledger/recalculate', authenticate, requireOwner, LedgerController.recalculate);

// Invoices
router.post('/invoices/generate', authenticate, requireMinRole('site_manager'), InvoiceController.generate);
router.get('/invoices/order/:orderId', authenticate, InvoiceController.getByOrder);
router.get('/invoices', authenticate, InvoiceController.getAll);

// Trips/Deliveries - all roles can view, but different access levels
router.post('/trips', authenticate, requireMinRole('site_manager'), validateBody(createTripSchema), TripController.create);
router.patch('/trips/:id/status', authenticate, TripController.updateStatus);
router.get('/trips/my', authenticate, requireRole('DRIVER'), TripController.getMyTrips);
router.get('/trips/active', authenticate, TripController.getActive);
router.get('/trips/stats', authenticate, requireMinRole('site_manager'), TripController.getStats);

// Stock
router.post('/stock/movements', authenticate, requireMinRole('site_manager'), validateBody(stockMovementSchema), StockController.createMovement);
router.get('/stock/current', authenticate, requireMinRole('site_manager'), StockController.getCurrent);
router.get('/stock/today', authenticate, requireMinRole('site_manager'), StockController.getToday);

// Expenses
router.post('/expenses', authenticate, requireMinRole('site_manager'), validateBody(createExpenseSchema), ExpenseController.create);
router.get('/expenses', authenticate, ExpenseController.getAll);
router.get('/expenses/summary', authenticate, requireMinRole('site_manager'), ExpenseController.getSummary);
router.delete('/expenses/:id', authenticate, requireOwner, ExpenseController.delete);

// Staff (owner/admin/site_manager)
router.post('/staff', authenticate, requireMinRole('site_manager'), validateBody(createStaffSchema), StaffController.create);
router.get('/staff', authenticate, requireMinRole('site_manager'), StaffController.getAll);
router.post('/staff/attendance', authenticate, requireMinRole('site_manager'), validateBody(markAttendanceSchema), StaffController.markAttendance);
router.get('/staff/attendance', authenticate, requireMinRole('site_manager'), StaffController.getAttendance);
router.post('/staff/advances', authenticate, requireMinRole('site_manager'), validateBody(giveAdvanceSchema), StaffController.giveAdvance);
router.get('/staff/payroll', authenticate, requireMinRole('site_manager'), StaffController.getPayroll);

// Cash Closing
router.get('/cash-closing/expected', authenticate, requireMinRole('site_manager'), CashClosingController.calculateExpected);
router.post('/cash-closing', authenticate, requireMinRole('site_manager'), validateBody(createCashClosingSchema), CashClosingController.create);
router.get('/cash-closing', authenticate, requireMinRole('site_manager'), CashClosingController.getAll);
router.get('/cash-closing/status', authenticate, requireMinRole('site_manager'), CashClosingController.getStatus);

// Health
router.get('/health', async (_req, res) => {
  const { healthCheck } = await import('../config/database');
  const ok = await healthCheck();
  res.status(ok ? 200 : 503).json({ status: ok ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() });
});

export default router;
