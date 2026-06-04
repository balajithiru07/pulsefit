import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Initialize invoices safely in global mock store
if (!global.mockDB) {
  global.mockDB = {};
}
global.mockDB.invoices = global.mockDB.invoices || [];

// Helper to add fake invoice
const addInvoice = (userId, email, plan, amount) => {
  const invoice = {
    _id: `INV-${new Date().getTime()}`,
    userId,
    email,
    plan,
    amount,
    currency: 'USD',
    status: 'Paid',
    date: new Date().toISOString().split('T')[0],
    billingAddress: '123 PulseFit Way, Health City, CA 90210'
  };
  global.mockDB.invoices.push(invoice);
  return invoice;
};

// @desc    Process simulated Stripe payment and upgrade tier
// @route   POST /api/payments/subscribe
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
  const { planName, cardNumber, expiry, cvc } = req.body;

  if (!planName) {
    return res.status(400).json({ message: 'Plan name is required' });
  }

  // Simple card info validation simulation
  if (cardNumber && cardNumber.replace(/\s/g, '').length !== 16) {
    return res.status(400).json({ message: 'Simulated Payment Error: Card number must be 16 digits' });
  }

  try {
    const amount = planName.toLowerCase() === 'premium' ? 14.99 : 0.00;

    if (global.isMockDB) {
      const userIndex = global.mockDB.users.findIndex(u => u._id.toString() === req.user._id.toString());
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      global.mockDB.users[userIndex].subscriptionStatus = planName === 'premium' ? 'premium' : 'free';
      const updatedUser = global.mockDB.users[userIndex];

      const invoice = addInvoice(updatedUser._id, updatedUser.email, planName, amount);

      res.json({
        message: `Successfully updated to ${planName.toUpperCase()} tier!`,
        subscriptionStatus: updatedUser.subscriptionStatus,
        invoice
      });
    } else {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.subscriptionStatus = planName === 'premium' ? 'premium' : 'free';
      await user.save();

      const invoice = addInvoice(user._id, user.email, planName, amount);

      res.json({
        message: `Successfully updated to ${planName.toUpperCase()} tier!`,
        subscriptionStatus: user.subscriptionStatus,
        invoice
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user invoice history
// @route   GET /api/payments/invoices
// @access  Private
router.get('/invoices', protect, async (req, res) => {
  try {
    const userInvoices = global.mockDB.invoices.filter(
      inv => inv.userId.toString() === req.user._id.toString()
    );
    res.json(userInvoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
