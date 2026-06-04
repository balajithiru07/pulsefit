import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFitness } from '../context/FitnessContext';
import { Check, CreditCard, Sparkles, Printer, FileText, ChevronRight } from 'lucide-react';

export const Billing = () => {
  const { user, upgradeSubscription, showToast } = useAuth();
  const { invoices, fetchFitnessData } = useFitness();

  const [checkoutPlan, setCheckoutPlan] = useState(null); // 'premium' or null
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCVC] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null); // for viewing printable invoice

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) return;

    setLoading(true);
    const invoice = await upgradeSubscription({
      planName: 'premium',
      cardNumber,
      expiry,
      cvc
    });
    setLoading(false);

    if (invoice) {
      setCheckoutPlan(null);
      setCardNumber('');
      setExpiry('');
      setCVC('');
      fetchFitnessData(); // refresh invoices list
    }
  };

  const printInvoice = (inv) => {
    setActiveInvoice(inv);
  };

  const isPremium = user?.subscriptionStatus === 'premium';

  return (
    <div className="animate-fade-in">
      
      {/* Invoice details print popup */}
      {activeInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(11, 15, 25, 0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '40px',
            position: 'relative',
            background: '#ffffff',
            color: '#0f172a'
          }}>
            <button 
              onClick={() => setActiveInvoice(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                color: '#334155',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close Print
            </button>

            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>PULSEFIT BILLING</h1>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Transaction details & invoice statement</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#64748b', fontWeight: 600 }}>BILLED TO:</div>
                <div style={{ fontWeight: 700, marginTop: '4px' }}>{user?.name || user?.email}</div>
                <div style={{ color: '#64748b' }}>{activeInvoice.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>INVOICE REF: <strong>{activeInvoice._id}</strong></div>
                <div>DATE: <strong>{activeInvoice.date}</strong></div>
                <div>STATUS: <strong style={{ color: '#10b981' }}>{activeInvoice.status}</strong></div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <strong>PulseFit Monthly Premium Membership Plan</strong><br />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Unlimited AI Coach Chats, Advanced macro analytics, wearable sync streaks</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 12px', fontWeight: 700 }}>
                    ${activeInvoice.amount.toFixed(2)} USD
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Billing Address: {activeInvoice.billingAddress}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>
                Total Paid: ${activeInvoice.amount.toFixed(2)}
              </div>
            </div>
            
            <button 
              onClick={() => window.print()}
              className="btn-primary"
              style={{ display: 'flex', gap: '8px', margin: '32px auto 0 auto', padding: '10px 24px', background: '#0f172a', color: '#fff' }}
            >
              <Printer size={16} /> Trigger System Print
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: checkoutPlan ? '1fr' : '1.5fr 1fr', gap: '28px' }}>
        
        {/* Pricing Plan Options */}
        {!checkoutPlan && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Choose your active plan</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Free Plan Card */}
              <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Free Tier Plan</h4>
                <div style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0' }}>$0.00 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month</span></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>Basic tracker for manual log workouts and water intake.</p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Log manual workouts</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Set personal weight goals</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Basic daily water tracking</li>
                </ul>

                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', pointerEvents: 'none', opacity: !isPremium ? 1 : 0.3 }}
                >
                  {!isPremium ? 'CURRENT PLAN ACTIVE' : 'Free Tier'}
                </button>
              </div>

              {/* Premium Plan Card */}
              <div className="glass-panel" style={{ 
                padding: '24px', 
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                borderColor: 'var(--color-cyan)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '16px',
                  background: 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))',
                  color: '#0b0f19',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  RECOMMENDED
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-cyan)' }}>Premium Plan</h4>
                <div style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0' }}>$14.99 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month</span></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>Advanced fitness insights with simulated wearable sync and AI Coach advisor.</p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Unlimited Chatbot AI Coach</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Advanced Sleep distribution charts</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Simulated wearable auto-synchronization</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--color-cyan)" /> Dynamic macro donut progress wheel</li>
                </ul>

                {isPremium ? (
                  <button className="btn-secondary" style={{ width: '100%', pointerEvents: 'none' }}>
                    CURRENT PLAN ACTIVE
                  </button>
                ) : (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => setCheckoutPlan('premium')}>
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simulated stripe card payment form */}
        {checkoutPlan && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Checkout Premium Upgrade</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Simulated Stripe checkout. Card details will not be stored.</p>

            <form onSubmit={handleCheckout}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>CREDIT CARD NUMBER</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="4000 1234 5678 9010"
                    style={{ paddingLeft: '44px' }}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>EXPIRY DATE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>CVC CODE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCVC(e.target.value)}
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setCheckoutPlan(null)}>
                  Cancel Checkout
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay $14.99 USD'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoice statements lists */}
        {!checkoutPlan && (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Invoice Receipts</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
              {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No billing invoices logged in this session.
                </div>
              ) : (
                invoices.map((inv) => (
                  <div 
                    key={inv._id} 
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>Premium Membership</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Date: {inv.date} &bull; Ref: {inv._id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>${inv.amount.toFixed(2)}</span>
                      <button 
                        onClick={() => printInvoice(inv)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', display: 'flex' }}
                        title="Download Statement"
                      >
                        <FileText size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
