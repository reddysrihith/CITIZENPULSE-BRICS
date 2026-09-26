import { useEffect, useState } from 'react';
import { IndianRupee, Search } from 'lucide-react';
import api from '../../services/api';

const statusClass = {
  created: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  released: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  refunded: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  failed: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadPayments = async () => {
    setError('');
    try {
      const res = await api.get('/admin/payments', { params: { status, search } });
      setPayments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments.');
    }
  };

  const updatePaymentStatus = async (payment, nextStatus) => {
    try {
      await api.patch(`/admin/payments/${payment._id}/status`, {
        status: nextStatus,
        refundReason: nextStatus === 'refunded' ? 'Refunded by admin' : undefined,
      });
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment.');
    }
  };

  const releasePayment = async (payment) => {
    try {
      await api.post(`/payments/${payment._id}/release`, { releaseNotes: 'Released from admin payment monitor' });
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release payment.');
    }
  };

  const refundPayment = async (payment) => {
    const reason = window.prompt('Refund reason', 'Refunded by admin');
    if (!reason) return;
    try {
      await api.post(`/payments/${payment._id}/refund`, { reason });
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refund payment.');
    }
  };

  useEffect(() => {
    loadPayments();
  }, [status]);

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">Payment Monitor</h1>
        <p className="text-slate-400 mt-1 font-semibold">Audit Razorpay orders, clients, freelancers, and payment status.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadPayments()}
            placeholder="Search Razorpay order or payment ID"
            className="w-full bg-slate-900/70 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All statuses</option>
          <option value="created">Created</option>
          <option value="paid">Paid</option>
          <option value="released">Released</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
        <button onClick={loadPayments} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest">Search</button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-[2px]">
              <tr>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Gig</th>
                <th className="px-6 py-4">Parties</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <p className="text-white text-xs font-black">{payment.razorpayOrderId}</p>
                    <p className="text-slate-500 text-xs font-semibold">{payment.razorpayPaymentId || 'Payment ID pending'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-200 font-bold">{payment.job?.title || 'Unknown gig'}</p>
                    <p className="text-slate-500 text-xs">{payment.job?.category || 'General'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-300 text-xs font-semibold">Client: {payment.client?.name || 'Unknown'}</p>
                    <p className="text-slate-500 text-xs font-semibold">Freelancer: {payment.freelancer?.name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-black">
                      <IndianRupee className="w-4 h-4" /> {Number(payment.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-xl border text-xs font-black capitalize ${statusClass[payment.status] || statusClass.created}`}>{payment.status}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-xs font-bold">
                    {new Date(payment.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <select
                        value={payment.status}
                        onChange={(e) => updatePaymentStatus(payment, e.target.value)}
                        className="bg-slate-900/70 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="created">Created</option>
                        <option value="paid">Paid</option>
                        <option value="released">Released</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => releasePayment(payment)}
                        disabled={!['paid', 'released'].includes(payment.status)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-black disabled:opacity-40"
                      >
                        Release
                      </button>
                      <button
                        type="button"
                        onClick={() => refundPayment(payment)}
                        disabled={payment.status === 'refunded'}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-black disabled:opacity-40"
                      >
                        Refund
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
