import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BadgeIndianRupee,
  Bell,
  Bike,
  Boxes,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Contact,
  CreditCard,
  FileBarChart,
  Gem,
  Gift,
  Image,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PackagePlus,
  QrCode,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Ticket,
  TreePine,
  UploadCloud,
  UserCheck,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';
import './admin-styles.css';
import logo from './images/logo.png';
import paymentQrImage from './images/qrcode.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BRAND_NAME = 'Luminate Ads';
const PAYMENT_TERMINAL = 'Terminal 3-Q155769084';
const api = axios.create({ baseURL: API_URL });
const ASSET_ORIGIN = API_URL.replace(/\/api\/?$/, '');

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luminateads_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function cleanFileName(value) {
  return String(value || 'report').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function reportTableHtml(title, columns, rows) {
  const logoUrl = new URL(logo, window.location.origin).href;
  const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          .report-header { display: flex; align-items: center; gap: 18px; margin: 0 0 20px; padding-bottom: 14px; border-bottom: 2px solid #f59e0b; }
          .report-logo { width: 190px; max-height: 58px; object-fit: contain; }
          .report-title { display: grid; gap: 4px; }
          .report-title span { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          h1 { font-size: 22px; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d8dee8; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f3f6fb; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <img class="report-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(BRAND_NAME)}" />
          <div class="report-title">
            <span>${escapeHtml(BRAND_NAME)}</span>
            <h1>${escapeHtml(title)}</h1>
          </div>
        </div>
        <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      </body>
    </html>`;
}

function exportExcel(title, columns, rows) {
  const blob = new Blob([reportTableHtml(title, columns, rows)], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanFileName(title)}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportPdf(title, columns, rows) {
  const popup = window.open('', '_blank');
  if (!popup) return;
  popup.document.write(reportTableHtml(title, columns, rows));
  popup.document.close();
  popup.focus();
  popup.print();
}

function absoluteAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function dailyAds(pkg) {
  return Number(pkg.totalAdvertisements || pkg.dailyAdsRequired || pkg.minAdsRequired || 0);
}

function dailyIncome(pkg) {
  if (pkg?.earningPerAdvertisement) return dailyAds(pkg) * Number(pkg.earningPerAdvertisement);
  return Number(pkg.monthlyGenerationAmount || 0) / 30;
}

function perAdValue(pkg) {
  if (pkg?.earningPerAdvertisement) return Number(pkg.earningPerAdvertisement);
  const ads = dailyAds(pkg);
  return ads ? dailyIncome(pkg) / ads : 0;
}

const commissionLevels = [
  { level: 1, percent: 10, amount999: 99.9, label: 'Direct Referral', members: '10 Members', income: '10 x ₹99.90 = ₹999', cumulative: '₹999' },
  { level: 2, percent: 5, amount999: 49.95, label: 'Level 2 Team', members: '100 Members', income: '100 x ₹49.95 = ₹4,995', cumulative: '₹5,994' },
  { level: 3, percent: 3, amount999: 29.97, label: 'Level 3 Team', members: '1,000 Members', income: '1,000 x ₹29.97 = ₹29,970', cumulative: '₹35,964' },
  { level: 4, percent: 1, amount999: 9.99, label: 'Level 4 Team', members: '10,000 Members', income: '10,000 x ₹9.99 = ₹99,900', cumulative: '₹1,35,864' },
  { level: 5, percent: 1, amount999: 9.99, label: 'Level 5 Team', members: '1,00,000 Members', income: '1,00,000 x ₹9.99 = ₹9,99,000', cumulative: '₹11,34,864' },
  { level: 6, percent: 0.5, amount999: 4.995, label: 'Level 6 Team', members: '10,00,000 Members', income: '10,00,000 x ₹4.995 = ₹49,95,000', cumulative: '₹61,29,864' },
  { level: 7, percent: 0.5, amount999: 4.995, label: 'Level 7 Team', members: '1,00,00,000 Members', income: '1,00,00,000 x ₹4.995 = ₹4,99,50,000', cumulative: '₹5,60,79,864' },
  { level: 8, percent: 0.25, amount999: 2.4975, label: 'Level 8 Team', members: '10,00,00,000 Members', income: '10,00,00,000 x ₹2.4975 = ₹24,97,50,000', cumulative: '₹30,58,29,864' },
  { level: 9, percent: 0.25, amount999: 2.4975, label: 'Level 9 Team', members: '1,00,00,00,000 Members', income: '1,00,00,00,000 x ₹2.4975 = ₹2,49,75,00,000', cumulative: '₹2,80,33,29,864' },
  { level: 10, percent: 0.25, amount999: 2.4975, label: 'Level 10 Team', members: '10,00,00,00,000 Members', income: '10,00,00,00,000 x ₹2.4975 = ₹24,97,50,00,000', cumulative: '₹27,77,83,29,864' }
];

const achievementClubs = [
  { name: 'Bronze Club', members: '1,000 members', benefit: 'Mobile, fridge, AC, TV, or any electric item', Icon: Smartphone },
  { name: 'Silver Club', members: '10,000 members', benefit: 'Bike benefit', Icon: Bike },
  { name: 'Gold Club', members: '1,00,000 members', benefit: 'Car benefit', Icon: Car },
  { name: 'Platinum Club', members: '10,00,000 members', benefit: 'House flat or ₹25 lakh benefit', Icon: Boxes },
  { name: 'Diamond Club', members: '100,00,000 members', benefit: 'Villa flat benefit', Icon: Gem }
];

const demo = {
  totals: {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    packageSales: 0,
    pendingPaymentAmount: 0,
    totalIncome: 0,
    pendingWithdrawals: 0,
    pendingTaskApprovals: 0,
    openTickets: 0
  },
  users: [],
  packages: [],
  payments: [],
  tasks: [],
  withdrawals: [],
  submissions: [],
  tickets: [],
  reports: {
    incomeByType: [],
    withdrawalsByStatus: [],
    recentTransactions: [],
    profitSnapshot: {},
    dailyBusiness: [],
    packagePerformance: [],
    distributionReport: [],
    withdrawalReport: [],
    transactions: []
  },
  banners: []
};

export default function AdminApp() {
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem('luminateads_admin_user') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('luminateads_admin_token'));
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const data = useAdminData(Boolean(token), refresh);

  function saveSession(payload) {
    localStorage.setItem('luminateads_admin_token', payload.token);
    localStorage.setItem('luminateads_admin_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setAdmin(payload.user);
    setNotice('Admin session started.');
  }

  function logout() {
    localStorage.removeItem('luminateads_admin_token');
    localStorage.removeItem('luminateads_admin_user');
    setToken(null);
    setAdmin(null);
  }

  if (!token) return <LoginScreen onSession={saveSession} />;

  const nav = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['active-users', 'Active Users', UserCheck],
    ['users', 'Users', Users],
    ['hierarchy', 'Hierarchy', TreePine],
    ['packages', 'Packages', Boxes],
    ['payments', 'Payments', CreditCard],
    ['tasks', 'Tasks', ClipboardCheck],
    ['withdrawals', 'Withdrawals', Wallet],
    ['support', 'Support', Ticket],
    ['reports', 'Reports', FileBarChart],
    ['content', 'Content', Image],
    ['notifications', 'Notifications', Bell]
  ];

  return (
    <div className="admin-shell">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <img className="brand-logo" src={logo} alt="Luminate Ads" />
        </div>
        <nav>
          {nav.map(([key, label, Icon]) => (
            <button key={key} className={active === key ? 'active' : ''} onClick={() => { setActive(key); setSidebarOpen(false); }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="admin-topbar">
          <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu"><Menu size={20} /></button>
          <div>
            <span className="kicker">Luminate Ads Admin Portal</span>
            <h1>{nav.find(([key]) => key === active)?.[1]}</h1>
          </div>
          <div className="admin-actions">
            <div className="admin-chip"><ShieldCheck size={16} /> {admin?.name || 'Admin'}</div>
            <button className="ghost" onClick={() => { const pwd = window.prompt('New password for admin'); if (pwd && pwd.length >= 6) { api.put(`/admin/users/${admin.id}/reset-password`, { password: pwd }).then(() => { setNotice('Admin password updated.'); }).catch((err) => { setNotice(err.response?.data?.message || 'Error updating password'); }); } }} title="Change password"><LogOut size={17} /> Change Password</button>
            <button className="ghost" onClick={logout}><LogOut size={17} /> Logout</button>
          </div>
        </header>

        {notice && <div className="toast" onAnimationEnd={() => setNotice('')}>{notice}</div>}

        {active === 'dashboard' && <Dashboard data={data} />}
        {active === 'active-users' && <ActiveUsersPage users={data.users} />}
        {active === 'users' && <UsersPage users={data.users} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'hierarchy' && <HierarchyPage users={data.users} admin={admin} />}
        {active === 'packages' && <PackagesPage packages={data.packages} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'payments' && <PaymentsPage payments={data.payments} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'tasks' && <TasksPage tasks={data.tasks} submissions={data.submissions} packages={data.packages} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'withdrawals' && <WithdrawalsPage withdrawals={data.withdrawals} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'support' && <SupportPage tickets={data.tickets} />}
        {active === 'reports' && <ReportsPage reports={data.reports} />}
        {active === 'content' && <ContentPage banners={data.banners} onRefresh={() => setRefresh((x) => x + 1)} />}
        {active === 'notifications' && <NotificationsPage users={data.users} />}
      </main>
    </div>
  );
}

function useAdminData(enabled, refresh) {
  const [data, setData] = useState(demo);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    Promise.allSettled([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
      api.get('/packages'),
      api.get('/tasks'),
      api.get('/payments/admin'),
      api.get('/withdrawals/admin'),
      api.get('/tasks/admin/submissions'),
      api.get('/support/admin'),
      api.get('/admin/reports'),
      api.get('/admin/banners'),
      api.get('/admin/transactions')
    ]).then((results) => {
      if (!mounted) return;
      setData({
        totals: results[0].value?.data?.totals || demo.totals,
        users: results[1].value?.data?.users || [],
        packages: results[2].value?.data?.packages || [],
        tasks: results[3].value?.data?.tasks || [],
        payments: results[4].value?.data?.payments || [],
        withdrawals: results[5].value?.data?.withdrawals || [],
        submissions: results[6].value?.data?.submissions || [],
        tickets: results[7].value?.data?.tickets || [],
        reports: { ...(results[8].value?.data || demo.reports), transactions: results[10].value?.data?.transactions || [] },
        banners: results[9].value?.data?.banners || []
      });
    });
    return () => {
      mounted = false;
    };
  }, [enabled, refresh]);

  return data;
}

function LoginScreen({ onSession }) {
  const [form, setForm] = useState({ identifier: 'admin@luminateads.com', password: 'Admin@12345' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.user?.role !== 'admin') throw new Error('Admin role required');
      onSession(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <span className="kicker">Operations Control</span>
          <h1>Luminate Ads Admin Portal</h1>
          <p>Approve payments, verify daily ad tasks, control packages, handle withdrawals, monitor hierarchy, and manage secure payout operations.</p>
        </div>
      </section>
      <section className="login-card">
        <div className="brand login-brand">
          <img className="brand-logo" src={logo} alt="Luminate Ads" />
        </div>
        <h2>Admin Sign In</h2>
        <form onSubmit={submit}>
          <label>Email or mobile<input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}><LogIn size={18} /> {busy ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </section>
    </div>
  );
}

function RegisteredUsersPanel({ users }) {
  return (
    <Panel title="Registered Users" icon={Users}>
      <DataTable
        columns={['Name', 'Mobile', 'Email', 'Status', 'Plan', 'Ads', 'Balance']}
        rows={(users || []).slice(0, 50).map((user) => [
          user.name,
          user.mobile,
          user.email,
          <Badge tone={user.status === 'active' ? 'green' : user.status === 'inactive' ? 'gray' : 'coral'}>{user.status}</Badge>,
          user.subscription?.planName || user.package?.name || 'None',
          `${user.subscription?.advertisementsCompleted ?? 0}/${user.subscription?.totalAdvertisements ?? 0}`,
          money(user.wallet?.balance || 0)
        ])}
        empty="No registered users yet."
      />
    </Panel>
  );
}

function Dashboard({ data }) {
  const cards = [
    ['Total Users', data.totals.totalUsers, Users],
    ['Active Users', data.totals.activeUsers, CheckCircle2],
    ['Collected Amount', money(data.totals.packageSales), BadgeIndianRupee],
    ['Distributed Rewards', money(data.totals.totalIncome), Wallet],
    ['Current Profit Zone', money(data.totals.profitAmount), FileBarChart],
    ['Pending Collection', money(data.totals.pendingPaymentAmount), CreditCard],
    ['Pending Withdrawals', data.totals.pendingWithdrawals, Wallet],
    ['Task Approvals', data.totals.pendingTaskApprovals, ClipboardCheck],
    ['Open Tickets', data.totals.openTickets, Ticket]
  ];

  return (
    <section className="page-grid">
      <div className="stat-grid">
        {cards.map(([label, value, Icon]) => (
          <article className="stat-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="two-col">
        <Panel title="Approval Priorities" icon={SlidersHorizontal}>
          <QueueRow label="Pending payments" value={data.totals.pendingPayments || 0} tone="gold" />
          <QueueRow label="Task proof" value={data.totals.pendingTaskApprovals || 0} tone="green" />
          <QueueRow label="Withdrawal requests" value={data.totals.pendingWithdrawals || 0} tone="coral" />
        </Panel>
        <Panel title="Business Snapshot" icon={FileBarChart}>
          <div className="snapshot">
            <span>Current profit zone</span>
            <strong>{money(data.totals.profitAmount)}</strong>
            <p>Approved collections minus credited customer rewards. Cash after paid withdrawals: {money(data.totals.cashAfterPaidWithdrawals)}.</p>
          </div>
        </Panel>
      </div>
      <AdminPlanSummary />
      <DailyDebitRunner />
      <RegisteredUsersPanel users={data.users} />
    </section>
  );
}

function AdminPlanSummary() {
  return (
    <div className="two-col plan-overview">
      <Panel title="Referral Commission Structure" icon={TreePine}>
        <div className="commission-grid">
          {commissionLevels.map((item) => (
            <div className="commission-cell" key={item.level}>
              <span>Level {item.level}</span>
              <strong>{item.percent}%</strong>
              <small>{item.members} · {item.income}</small>
            </div>
          ))}
        </div>
        <div className="total-band">
          <span>Network example cumulative earnings</span>
          <strong style={{fontSize:'0.9em',wordBreak:'break-word'}}>₹27,77,83,29,864</strong>
        </div>
      </Panel>
      <Panel title="Payment QR Reference" icon={QrCode}>
        <div className="admin-qr-card">
          <img className="admin-qr-img" src={paymentQrImage} alt="Payment QR code" />
        </div>
      </Panel>
    </div>
  );
}

function DailyDebitRunner() {
  const [date, setDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() - 1);
    return value.toISOString().slice(0, 10);
  });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function runDebit() {
    setBusy(true);
    try {
      const res = await api.post('/admin/daily-debits/run', { date });
      setResult(res.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Daily Advertisement Debit" icon={ClipboardCheck}>
      <div className="payment-reference-row">
        <div className="stack">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button className="primary" onClick={runDebit} disabled={busy}>{busy ? 'Running...' : 'Run Missed-Day Debit'}</button>
        </div>
        <div className="payment-checks">
          <QueueRow label="Processed users" value={result?.processed ?? '-'} tone="gold" />
          <QueueRow label="Debited users" value={result?.debited ?? '-'} tone="coral" />
          <QueueRow label="Skipped users" value={result?.skipped ?? '-'} tone="green" />
        </div>
      </div>
      {result?.message && <p className="error">{result.message}</p>}
      {result?.results?.length ? (
        <DataTable
          columns={['User', 'Plan', 'Ads', 'Status', 'Debit']}
          rows={result.results.slice(0, 20).map((item) => [
            item.name,
            item.packageName,
            `${item.completedAds}/${item.requiredAds}`,
            <Badge tone={item.status === 'debited' ? 'coral' : 'green'}>{item.status}</Badge>,
            money(item.debitAmount)
          ])}
          empty="No debit results."
        />
      ) : null}
    </Panel>
  );
}

function ActiveUsersPage({ users }) {
  const [search, setSearch] = useState('');
  const activeUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (users || [])
      .filter((user) => user.status === 'active')
      .filter((user) => !query || [
        user.name,
        user.email,
        user.mobile,
        user.referralCode,
        user.subscription?.planName,
        user.package?.name,
        user.sponsor?.name
      ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [users, search]);

  const totals = useMemo(() => activeUsers.reduce((summary, user) => {
    const approvedPayments = (user.payments || []).filter((payment) => payment.status === 'approved');
    summary.joining += approvedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    summary.balance += Number(user.wallet?.availableBalance ?? user.wallet?.balance ?? 0);
    summary.earned += Number(user.wallet?.totalEarned || 0);
    return summary;
  }, { joining: 0, balance: 0, earned: 0 }), [activeUsers]);

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function daysRemaining(value) {
    if (!value) return '-';
    const milliseconds = new Date(value).setHours(23, 59, 59, 999) - Date.now();
    return Math.max(0, Math.ceil(milliseconds / 86400000));
  }

  const rows = activeUsers.map((user) => {
    const approvedPayments = (user.payments || [])
      .filter((payment) => payment.status === 'approved')
      .sort((a, b) => new Date(b.approvedAt || b.createdAt || 0) - new Date(a.approvedAt || a.createdAt || 0));
    const subscription = user.subscription || {};
    const plans = subscription.plans || approvedPayments.map((payment) => ({
      paymentId: payment.id,
      planName: payment.package?.name || 'Plan',
      planAmount: payment.package?.baseAmount,
      payableAmount: payment.amount,
      planStartDate: payment.approvedAt || payment.createdAt,
      planExpiryDate: payment.subscriptionExpiresAt,
      status: payment.subscriptionExpiresAt && new Date(payment.subscriptionExpiresAt) >= new Date() ? 'active' : 'expired'
    }));
    const wallet = user.wallet || {};

    return [
      <div className="stack" key={`${user.id}-member`}>
        <strong>{user.name}</strong>
        <small>{user.referralCode || 'No referral code'}</small>
      </div>,
      <div className="stack" key={`${user.id}-contact`}>
        <span>{user.mobile || '-'}</span>
        <small>{user.email || '-'}</small>
      </div>,
      <div className="stack" key={`${user.id}-plan`}>
        {plans.length ? plans.map((plan) => <span key={plan.paymentId}><strong>{plan.planName}</strong> <small>({plan.status})</small></span>) : <strong>Free Joiner</strong>}
      </div>,
      <div className="stack" key={`${user.id}-dates`}>
        <span>Account: {formatDate(user.createdAt)}</span>
        {plans.map((plan) => <small key={plan.paymentId}>{plan.planName}: {formatDate(plan.planStartDate)}</small>)}
      </div>,
      <div className="stack" key={`${user.id}-expiry`}>
        {plans.length ? plans.map((plan) => <span key={plan.paymentId}><strong>{formatDate(plan.planExpiryDate)}</strong> <small>({daysRemaining(plan.planExpiryDate)} days)</small></span>) : <small>No paid plans</small>}
      </div>,
      <div className="stack" key={`${user.id}-amount`}>
        {plans.length ? plans.map((plan) => <span key={plan.paymentId}><strong>{money(plan.payableAmount || plan.planAmount)}</strong> <small>({plan.planName})</small></span>) : <strong>{money(0)}</strong>}
      </div>,
      <div className="stack" key={`${user.id}-wallet`}>
        <strong>{money(wallet.availableBalance ?? wallet.balance ?? 0)}</strong>
        <small>Earned: {money(wallet.totalEarned)} · Withdrawn: {money(wallet.withdrawnAmount)}</small>
      </div>,
      <div className="stack" key={`${user.id}-details`}>
        <span>Sponsor: {user.sponsor?.name || 'Direct'}</span>
        <small>Email {user.isEmailVerified ? 'verified' : 'not verified'} · Mobile {user.isMobileVerified ? 'verified' : 'not verified'}</small>
        <small>Last login: {formatDate(user.lastLoginAt)}</small>
      </div>
    ];
  });

  return (
    <section className="page-grid">
      <div className="stat-grid">
        {[
          ['Active Users', activeUsers.length, UserCheck],
          ['Joining Amount', money(totals.joining), BadgeIndianRupee],
          ['Remaining Balance', money(totals.balance), Wallet],
          ['Total Earned', money(totals.earned), Gift]
        ].map(([label, value, Icon]) => (
          <article className="stat-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <Panel
        title="Active User Details"
        icon={UserCheck}
        action={(
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search active users..." />
          </div>
        )}
      >
        <DataTable
          columns={['Member', 'Contact', 'Plan', 'Joining Dates', 'Plan Expiry', 'Joining Amount', 'Remaining Now', 'Other Details']}
          rows={rows}
          empty={search ? 'No active users match your search.' : 'No active users found.'}
        />
      </Panel>
    </section>
  );
}

function UsersPage({ users, onRefresh }) {
  function approvedPlanNames(user) {
    const names = (user.payments || [])
      .filter((payment) => payment.status === 'approved' && payment.package?.name)
      .map((payment) => payment.package.name);
    return [...new Set(names)].join(', ') || user.package?.name || 'Not selected';
  }

  async function editUser(user) {
    const name = window.prompt('Edit member name', user.name);
    if (!name) return;
    const mobile = window.prompt('Edit mobile number', user.mobile || '') || user.mobile;
    await api.put(`/admin/users/${user.id}`, { name, mobile });
    onRefresh();
  }

  async function resetPassword(user) {
    const password = window.prompt(`New password for ${user.name}`);
    if (!password) return;
    await api.put(`/admin/users/${user.id}/reset-password`, { password });
    onRefresh();
  }

  return (
    <Panel title="Member Management" icon={Users} action={<SearchBox />}>
      <DataTable
        columns={['Name', 'Contact', 'Approved Plans', 'Subscription', 'Sponsor', 'Status', 'Action']}
        rows={users.map((user) => [
          user.name,
          `${user.email || ''}\n${user.mobile || ''}`,
          approvedPlanNames(user),
          <div className="stack">
            {(user.subscription?.plans || []).length ? user.subscription.plans.map((plan) => (
              <small key={plan.paymentId}>{plan.planName}: {new Date(plan.planStartDate).toLocaleDateString()} – {new Date(plan.planExpiryDate).toLocaleDateString()} ({plan.status})</small>
            )) : <small>Free account</small>}
          </div>,
          user.sponsor?.name || 'Direct',
          <Badge tone={user.status === 'active' ? 'green' : user.status === 'blocked' ? 'coral' : 'gold'}>{user.status}</Badge>,
          <div className="row-actions">
            <button className="mini" onClick={() => editUser(user)}>Edit</button>
            <button className="mini" onClick={async () => { await api.put(`/admin/users/${user.id}`, { status: user.status === 'active' ? 'inactive' : 'active' }); onRefresh(); }}>{user.status === 'active' ? 'Inactive' : 'Activate'}</button>
            <button className="mini" onClick={async () => { await api.put(`/admin/users/${user.id}`, { status: 'active', isMobileVerified: true, isEmailVerified: true }); onRefresh(); }}>Permission</button>
            <button className="mini" onClick={() => resetPassword(user)}>Password</button>
            {user.status === 'blocked' ? (
              <button className="mini approve" onClick={async () => { await api.put(`/admin/users/${user.id}`, { status: 'active', isMobileVerified: true, isEmailVerified: true }); onRefresh(); }}>Restore</button>
            ) : (
              <button className="mini reject" onClick={async () => { if (window.confirm(`Block login for ${user.name}?`)) { await api.delete(`/admin/users/${user.id}`); onRefresh(); } }}>Block</button>
            )}
            <button className="mini reject" onClick={async () => { if (window.confirm(`Permanently delete ${user.name} and all related records? This cannot be undone.`)) { await api.delete(`/admin/users/${user.id}/permanent`); onRefresh(); } }}>Delete</button>
          </div>
        ])}
        empty="No users yet."
      />
    </Panel>
  );
}

function HierarchyPage({ users, admin }) {
  const hierarchyUsers = useMemo(() => {
    const list = admin?.id ? [admin, ...users] : users;
    return list.filter((user, index, rows) => user?.id && rows.findIndex((item) => item.id === user.id) === index);
  }, [admin, users]);
  const [selectedUserId, setSelectedUserId] = useState(hierarchyUsers[0]?.id || '');
  const [tree, setTree] = useState(null);
  const [downline, setDownline] = useState([]);

  useEffect(() => {
    if (!selectedUserId && hierarchyUsers[0]?.id) setSelectedUserId(hierarchyUsers[0].id);
  }, [hierarchyUsers, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;
    let mounted = true;
    Promise.allSettled([
      api.get(`/referrals/admin/${selectedUserId}/tree`),
      api.get(`/referrals/admin/${selectedUserId}/downline`)
    ]).then((results) => {
      if (!mounted) return;
      setTree(results[0].value?.data?.tree || null);
      setDownline(results[1].value?.data?.referrals || []);
    });
    return () => {
      mounted = false;
    };
  }, [selectedUserId]);

  const selectedUser = hierarchyUsers.find((user) => user.id === selectedUserId);
  const treeData = tree || buildDemoHierarchy(selectedUser);

  return (
    <div className="hierarchy-admin-layout">
      <Panel title="Profile Hierarchy" icon={TreePine}>
        <div className="stack">
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            <option value="">Select profile</option>
            {hierarchyUsers.map((user) => <option key={user.id} value={user.id}>{user.role === 'admin' ? 'Admin / Office' : user.name} · {user.referralCode}</option>)}
          </select>
          <div className="hierarchy-summary">
            <TreePine size={28} />
            <h3>{selectedUser?.name || tree?.name || 'Select a profile'}</h3>
            <p>Invite code: <strong>{selectedUser?.referralCode || tree?.referralCode || '-'}</strong></p>
            <p>Direct referrals: <strong>{downline.filter((item) => item.level === 1).length}</strong></p>
            <p>Total hierarchy count: <strong>{downline.length}</strong></p>
          </div>
        </div>
      </Panel>
      <Panel title="Hierarchy Tree View" icon={TreePine}>
        <div className="admin-tree-wrap">
          <HierarchyTree node={treeData} root />
        </div>
      </Panel>
      <Panel title="Hierarchy Order" icon={Users}>
        <DataTable
          columns={['Level', 'Name', 'Code', 'Status']}
          rows={downline.map((item) => [
            `Level ${item.level}`,
            item.child?.name || 'Member',
            item.child?.referralCode || '-',
            <Badge tone={item.child?.status === 'active' ? 'green' : 'gold'}>{item.child?.status || '-'}</Badge>
          ])}
          empty="No hierarchy records for this profile yet."
        />
      </Panel>
    </div>
  );
}

function buildDemoHierarchy(user) {
  return {
    name: user?.name || 'Selected Profile',
    referralCode: user?.referralCode || 'YOU',
    directReferrals: [
      {
        name: 'Member A',
        referralCode: '1',
        directReferrals: [
          { name: 'Member C', referralCode: '5', directReferrals: [{ name: 'Member G', referralCode: '9', directReferrals: [] }] },
          { name: 'Member D', referralCode: '3', directReferrals: [{ name: 'Member H', referralCode: '7', directReferrals: [] }] }
        ]
      },
      {
        name: 'Member B',
        referralCode: '2',
        directReferrals: [
          { name: 'Member E', referralCode: '4', directReferrals: [{ name: 'Member I', referralCode: '8', directReferrals: [] }] },
          { name: 'Member F', referralCode: '6', directReferrals: [{ name: 'Member J', referralCode: '10', directReferrals: [] }] }
        ]
      }
    ]
  };
}

function HierarchyTree({ node, root = false }) {
  const children = node?.directReferrals || [];
  return (
    <div className={root ? 'tree-node tree-root' : 'tree-node'}>
      <div className={root ? 'tree-member root-member' : 'tree-member'}>
        {root ? <Contact size={24} /> : <span>{node?.referralCode || '?'}</span>}
        <strong>{node?.name || 'Member'}</strong>
      </div>
      {children.length > 0 && (
        <div className="tree-children">
          {children.slice(0, 4).map((child) => (
            <HierarchyTree node={child} key={child.id || child.referralCode || child.name} />
          ))}
        </div>
      )}
    </div>
  );
}

function PackagesPage({ packages, onRefresh }) {
  const emptyForm = { name: '', baseAmount: '', taxAmount: '0', finalAmount: '', dailyAdsRequired: '20', earningPerAdvertisement: '', dailyWorkMinutes: '', dailyDebitAmount: '', freeBannerCount: '', status: 'active' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');

  async function createPackage(event) {
    event.preventDefault();
    const payload = {
      name: form.name,
      baseAmount: Number(form.baseAmount),
      taxAmount: Number(form.taxAmount || 0),
      finalAmount: Number(form.finalAmount || (Number(form.baseAmount || 0) + Number(form.taxAmount || 0))),
      minAdsRequired: Number(form.dailyAdsRequired || 0),
      dailyAdsRequired: Number(form.dailyAdsRequired || 0),
      earningPerAdvertisement: Number(form.earningPerAdvertisement || 0),
      dailyWorkMinutes: Number(form.dailyWorkMinutes || 0),
      dailyDebitAmount: Number(form.dailyDebitAmount || 0),
      freeBannerCount: Number(form.freeBannerCount || 0),
      status: form.status
    };
    if (editingId) {
      await api.put(`/packages/${editingId}`, payload);
    } else {
      await api.post('/packages', payload);
    }
    setForm(emptyForm);
    setEditingId('');
    onRefresh();
  }

  function editPackage(pkg) {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || '',
      baseAmount: pkg.baseAmount || '',
      taxAmount: pkg.taxAmount || '',
      finalAmount: pkg.finalAmount || '',
      dailyAdsRequired: pkg.totalAdvertisements || pkg.dailyAdsRequired || pkg.minAdsRequired || '',
      earningPerAdvertisement: pkg.earningPerAdvertisement || perAdValue(pkg) || '',
      dailyWorkMinutes: pkg.dailyWorkMinutes || '',
      dailyDebitAmount: pkg.dailyDebitAmount || '',
      freeBannerCount: pkg.freeBannerCount ?? '',
      status: pkg.status || 'active'
    });
  }

  return (
    <div className="page-grid">
      <div className="two-col">
        <Panel title="Packages" icon={Boxes}>
          <DataTable
            columns={['Plan', 'Amount', 'Payable', 'Total Ads', 'Per Ad', 'Daily Earning', 'Status', 'Action']}
            rows={packages.map((pkg) => [
              pkg.name,
              money(pkg.baseAmount),
              money(pkg.finalAmount),
              `${dailyAds(pkg)} ads`,
              money(perAdValue(pkg)),
              money(dailyIncome(pkg)),
              <Badge tone={pkg.status === 'active' ? 'green' : 'gold'}>{pkg.status}</Badge>,
              <div className="row-actions">
                <button className="mini" onClick={() => editPackage(pkg)}>Edit</button>
                <button className="mini" onClick={async () => { await api.patch(`/packages/${pkg.id}/status`, { status: pkg.status === 'active' ? 'inactive' : 'active' }); onRefresh(); }}>Status</button>
                <button className="mini reject" onClick={async () => { if (window.confirm(`Deactivate ${pkg.name}?`)) { await api.delete(`/packages/${pkg.id}`); onRefresh(); } }}>Deactivate</button>
              </div>
            ])}
            empty="No packages available."
          />
        </Panel>
        <Panel title={editingId ? 'Edit Package' : 'Create Package'} icon={PackagePlus}>
          <form className="stack" onSubmit={createPackage}>
            <input required placeholder="Package name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="number" placeholder="Base amount" value={form.baseAmount} onChange={(e) => setForm({ ...form, baseAmount: e.target.value })} />
            <input type="number" placeholder="GST tax amount" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} />
            <input type="number" placeholder="Final amount (auto if blank)" value={form.finalAmount} onChange={(e) => setForm({ ...form, finalAmount: e.target.value })} />
            <input required type="number" min="0" placeholder="Total advertisements" value={form.dailyAdsRequired} onChange={(e) => setForm({ ...form, dailyAdsRequired: e.target.value })} />
            <input required type="number" min="0" step="0.01" placeholder="Earning per advertisement" value={form.earningPerAdvertisement} onChange={(e) => setForm({ ...form, earningPerAdvertisement: e.target.value })} />
            <input required type="number" min="0" placeholder="Daily work minutes" value={form.dailyWorkMinutes} onChange={(e) => setForm({ ...form, dailyWorkMinutes: e.target.value })} />
            <input required type="number" min="0" step="0.01" placeholder="Daily debit amount" value={form.dailyDebitAmount} onChange={(e) => setForm({ ...form, dailyDebitAmount: e.target.value })} />
            <input type="number" min="0" placeholder="Free banner count" value={form.freeBannerCount} onChange={(e) => setForm({ ...form, freeBannerCount: e.target.value })} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select>
            <button className="primary">{editingId ? 'Update Package' : 'Save Package'}</button>
            {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(''); setForm(emptyForm); }}>Cancel Edit</button>}
          </form>
        </Panel>
      </div>
      <AdminPlanSummary />
      <Panel title="Daily Advertisement Income Plan" icon={BadgeIndianRupee}>
        <DataTable
          columns={['Plan', 'Total Ads', 'Per Ad Earning', 'Daily Earning', 'Monthly Estimate', 'Debit']}
          rows={packages.map((pkg) => [
            pkg.name,
            `${dailyAds(pkg)} ads`,
            money(perAdValue(pkg)),
            money(dailyIncome(pkg)),
            money(dailyIncome(pkg) * 30),
            money(pkg.dailyDebitAmount)
          ])}
          empty="No plans configured."
        />
      </Panel>
      <Panel title="Level Achievement Benefits" icon={Gift}>
        <div className="achievement-grid">
          {achievementClubs.map(({ name, members, benefit, Icon }) => (
            <article className="achievement-card" key={name}>
              <Icon size={24} />
              <span>{members}</span>
              <strong>{name}</strong>
              <p>{benefit}</p>
            </article>
          ))}
        </div>
        <div className="total-band gift-band">
          <span>Benefit One</span>
          <strong>50 direct references within one month = ₹10,000 worth gift</strong>
        </div>
      </Panel>
    </div>
  );
}

function PaymentsPage({ payments, onRefresh }) {
  async function decide(id, action) {
    await api.put(`/payments/admin/${id}/${action}`, { adminRemarks: action === 'approve' ? 'Verified' : 'Rejected by admin' });
    onRefresh();
  }

  return (
    <div className="page-grid">
      <Panel title="Payment QR Reference" icon={QrCode}>
        <div className="payment-reference-row">
          <div className="admin-qr-card compact">
            <img className="admin-qr-img compact" src={paymentQrImage} alt="Payment QR code" />
          </div>
          <div className="payment-checks">
            <QueueRow label="Check payment proof" value="Required" tone="gold" />
            <QueueRow label="Match UTR / transaction number" value="Required" tone="green" />
            <QueueRow label="Approve only after received amount" value="Manual" tone="coral" />
          </div>
        </div>
      </Panel>
      <Panel title="Payment Approvals" icon={CreditCard} action={<SearchBox />}>
        <DataTable
          columns={['User', 'Package', 'Amount', 'Mode', 'UTR', 'Proof', 'Status', 'Action']}
          rows={payments.map((payment) => [
            payment.user?.name || 'Member',
            payment.package?.name || '-',
            money(payment.amount),
            payment.paymentMode,
            payment.utrNumber || '-',
            payment.proofUrl || payment.screenshot ? <a className="mini" href={payment.proofUrl || absoluteAssetUrl(payment.screenshot)} target="_blank" rel="noreferrer">View / Download</a> : '-',
            <Badge tone={payment.status === 'approved' ? 'green' : payment.status === 'rejected' ? 'coral' : 'gold'}>{payment.status}</Badge>,
            <ActionPair onApprove={() => decide(payment.id, 'approve')} onReject={() => decide(payment.id, 'reject')} disabled={payment.status !== 'pending'} />
          ])}
          empty="No payments found."
        />
      </Panel>
    </div>
  );
}

function TasksPage({ tasks, submissions, packages, onRefresh }) {
  const emptyTask = { title: '', platform: 'youtube', taskUrl: '', description: '', rewardAmount: '0.5', packageId: '', status: 'active' };
  const [task, setTask] = useState(emptyTask);
  const [taskEditor, setTaskEditor] = useState(null);
  const [creatorPlan, setCreatorPlan] = useState(null);
  const newTodayRows = (count = 10, packageId = '', rewardAmount = 0.5) => Array.from({ length: count }, (_, index) => ({ title: `Today's Advertisement ${index + 1}`, taskUrl: '', platform: 'youtube', description: 'Watch the complete advertisement to finish this task.', rewardAmount: String(rewardAmount), packageId, status: 'active' }));
  const [todayTasks, setTodayTasks] = useState([]);
  const rewardForPackage = (packageId) => {
    if (!packageId) return 0.5;
    return perAdValue(packages.find((pkg) => pkg.id === packageId));
  };
  const sortedTaskPackages = [...packages].sort((a, b) => Number(a.baseAmount || a.finalAmount || 0) - Number(b.baseAmount || b.finalAmount || 0)).slice(0, 3);
  const creatorOptions = [
    { label: 'Free', count: 10, packageId: '', reward: 0.5 },
    ...sortedTaskPackages.map((pkg, index) => ({ label: `${String.fromCharCode(65 + index)} Plan`, count: 20, packageId: pkg.id, reward: perAdValue(pkg), packageName: pkg.name }))
  ];

  function openTaskCreator(option) {
    setCreatorPlan(option);
    setTodayTasks(newTodayRows(option.count, option.packageId, option.reward));
  }

  async function postTodayTwenty() {
    if (todayTasks.some((item) => !item.taskUrl.trim())) {
      window.alert('Please enter all 20 task URLs before posting.');
      return;
    }
    try {
      await api.post('/tasks/admin/post-today-20', { packageId: creatorPlan?.packageId || null, tasks: todayTasks.map((item) => ({ ...item, packageId: creatorPlan?.packageId || null, rewardAmount: Number(creatorPlan?.reward || 0.5) })) });
      setTodayTasks([]);
      setCreatorPlan(null);
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Unable to post today\'s tasks.');
    }
  }

  async function createTask(event) {
    event.preventDefault();
    const payload = {
      ...task,
      rewardAmount: Number(task.rewardAmount || 0),
      packageId: task.packageId || null
    };
    try {
      await api.post('/tasks', payload);
      setTask(emptyTask);
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Unable to create this task.');
    }
  }

  function editTask(item) {
    const dateKey = String(item.startsAt || item.createdAt || '').slice(0, 10);
    const packageKey = item.packageId || '';
    const matchingRows = tasks.filter((candidate) => {
      const candidateDate = String(candidate.startsAt || candidate.createdAt || '').slice(0, 10);
      return dateKey && candidateDate === dateKey && (candidate.packageId || '') === packageKey;
    });
    const rows = (matchingRows.length ? matchingRows : [item]).map((candidate) => ({
      id: candidate.id,
      title: candidate.title || '',
      platform: candidate.platform || 'youtube',
      taskUrl: candidate.taskUrl || '',
      description: candidate.description || '',
      rewardAmount: candidate.rewardAmount || rewardForPackage(candidate.packageId || ''),
      packageId: candidate.packageId || '',
      status: candidate.status || 'active'
    }));
    const packageName = item.package?.name || packages.find((pkg) => pkg.id === packageKey)?.name || 'Free plan';
    setTaskEditor({ mode: 'single', anchorId: item.id, dateKey, packageName, rows });
  }

  function updateEditorRow(id, field, value) {
    setTaskEditor((editor) => ({ ...editor, rows: editor.rows.map((row) => row.id === id ? { ...row, [field]: value } : row) }));
  }

  async function saveTaskEditor() {
    const rows = taskEditor.mode === 'batch' ? taskEditor.rows : taskEditor.rows.filter((row) => row.id === taskEditor.anchorId);
    if (rows.some((row) => !row.title.trim() || !row.taskUrl.trim() || !row.description.trim())) {
      window.alert('Title, task URL and instructions are required for every task.');
      return;
    }
    try {
      await Promise.all(rows.map((row) => api.put(`/tasks/${row.id}`, {
        title: row.title,
        platform: row.platform,
        taskUrl: row.taskUrl,
        description: row.description,
        rewardAmount: Number(row.rewardAmount || 0),
        packageId: row.packageId || null,
        status: row.status
      })));
      setTaskEditor(null);
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Unable to save the selected task(s).');
    }
  }

  async function decide(id, action) {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this task completion?`)) return;
    try {
      await api.put(`/tasks/admin/submissions/${id}/${action}`, { adminRemarks: action === 'approve' ? 'Task fully completed and verified' : 'Task is not fully completed. Please finish this task and try again.' });
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || `Unable to ${action} this completion.`);
    }
  }

  async function changeTaskStatus(item) {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Change "${item.title}" to ${nextStatus}?`)) return;
    try {
      await api.put(`/tasks/${item.id}`, { status: nextStatus });
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Unable to change task status.');
    }
  }

  async function deleteTask(item) {
    if (!window.confirm(`Delete "${item.title}" permanently? This removes the task from member task lists.`)) return;
    try {
      await api.delete(`/tasks/${item.id}`);
      onRefresh();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Unable to delete this task.');
    }
  }

  async function deleteAllTasks() {
    if (!tasks.length) return;
    if (!window.confirm(`Delete all ${tasks.length} tasks permanently? This removes the current task library from member task lists.`)) return;
    const results = await Promise.allSettled(tasks.map((item) => api.delete(`/tasks/${item.id}`)));
    onRefresh();
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length) window.alert(`${tasks.length - failures.length} task(s) deleted; ${failures.length} could not be deleted.`);
  }

  return (
    <>
    <div className="task-creation-launch">
      <div><strong>Today's Task Creation</strong><span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      <div className="task-plan-create-actions">
        {creatorOptions.map((option) => <button className={`task-plan-create-button ${option.packageId ? 'paid' : 'free'}`} key={option.label} onClick={() => openTaskCreator(option)}>Create {option.count} {option.label} Tasks</button>)}
      </div>
    </div>
    <div className="tasks-admin-stack">
      <Panel title="Task Library" icon={ClipboardCheck}>
        {tasks.length ? (
          <div className="panel-actions">
            <button className="mini reject" onClick={deleteAllTasks}>Delete All Tasks</button>
          </div>
        ) : null}
        <div className="task-admin-scroll"><DataTable
          columns={['Title', 'Platform', 'Reward', 'Status', 'Action']}
          rows={tasks.map((item) => [
            item.title,
            item.platform,
            money(item.rewardAmount),
            <Badge tone={item.status === 'active' ? 'green' : 'gold'}>{item.status}</Badge>,
            <div className="row-actions">
              <button className="mini" onClick={() => editTask(item)}>Edit</button>
              <button className="mini" onClick={() => changeTaskStatus(item)}>Status</button>
              <button className="mini reject" onClick={() => deleteTask(item)}>Delete</button>
            </div>
          ])}
          empty="No tasks created yet."
        /></div>
      </Panel>
      <Panel title="Task Completion Review" icon={ClipboardCheck}>
        <div className="task-admin-scroll"><DataTable
          columns={['User', 'Task', 'Date', 'Progress', 'Reward', 'Status', 'Action']}
          rows={submissions.map((item) => [
            item.user?.name || 'Member',
            item.task?.title || '-',
            item.taskDate || '-',
            `${Number(item.watchPercent || 0)}%`,
            money(item.task?.rewardAmount),
            <Badge tone={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'coral' : 'gold'}>{item.status}</Badge>,
            <div className="row-actions">
              <button className="mini approve" onClick={() => decide(item.id, 'approve')} disabled={item.status === 'approved' || Number(item.watchPercent || 0) < 100}><CheckCircle2 size={14} /> Approve</button>
              <button className="mini reject" onClick={() => decide(item.id, 'reject')} disabled={item.status === 'approved' || item.status === 'rejected'}><XCircle size={14} /> Remark</button>
            </div>
          ])}
          empty="No task completion updates yet."
        /></div>
      </Panel>
      <Panel title="Create Promotion Task" icon={ClipboardCheck}>
        <form className="stack" onSubmit={createTask}>
          <input required placeholder="Task title" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
          <select value={task.platform} onChange={(e) => setTask({ ...task, platform: e.target.value })}>
            {['youtube', 'instagram', 'facebook', 'google', 'website', 'whatsapp', 'banner', 'local', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input placeholder="Task URL" value={task.taskUrl} onChange={(e) => setTask({ ...task, taskUrl: e.target.value })} />
          <textarea required placeholder="Task instructions" value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
          <input type="number" step="0.01" placeholder="Reward per completed task" value={task.rewardAmount} readOnly title="Automatically calculated from the selected plan" />
          <select value={task.packageId} onChange={(e) => setTask({ ...task, packageId: e.target.value, rewardAmount: String(rewardForPackage(e.target.value)) })}>
            <option value="">Free plan</option>
            {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
          </select>
          <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option></select>
          <button className="primary">Create Task</button>
        </form>
      </Panel>
    </div>
    {creatorPlan && (
      <div className="task-creator-backdrop" role="dialog" aria-modal="true">
        <div className="task-creator-modal">
          <div className="task-creator-head"><div><h2>Create Today's {creatorPlan.count} {creatorPlan.label} Tasks</h2><p>{creatorPlan.packageName || 'Free plan'} · Reward {money(creatorPlan.reward)} per completed task · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div><button className="ghost" onClick={() => setCreatorPlan(null)}>Close</button></div>
          <div className="task-creator-table-wrap">
            <table className="task-creator-table"><thead><tr><th>#</th><th>Title</th><th>Platform</th><th>Task URL</th><th>Instructions</th><th>Reward</th><th>Status</th></tr></thead><tbody>
            {todayTasks.map((item, index) => {
              const update = (field, value) => setTodayTasks((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
              return <tr key={index}><td>{index + 1}</td><td><input value={item.title} onChange={(e) => update('title', e.target.value)} /></td><td><select value={item.platform} onChange={(e) => update('platform', e.target.value)}>{['youtube','instagram','facebook','google','website','whatsapp','banner','local','other'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input value={item.taskUrl} onChange={(e) => update('taskUrl', e.target.value)} placeholder="URL" /></td><td><textarea value={item.description} onChange={(e) => update('description', e.target.value)} /></td><td><input type="number" step="0.01" value={creatorPlan.reward} readOnly title="Automatically fixed for this plan" /></td><td><select value={item.status} onChange={(e) => update('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option></select></td></tr>;
            })}
            </tbody></table>
          </div>
          <div className="task-creator-actions"><button className="ghost" onClick={() => setCreatorPlan(null)}>Cancel</button><button className="primary" onClick={postTodayTwenty}>Post today's {creatorPlan.count} {creatorPlan.label} tasks</button></div>
        </div>
      </div>
    )}
    {taskEditor && (
      <div className="task-creator-backdrop" role="dialog" aria-modal="true" aria-label="Edit promotion tasks">
        <div className="task-creator-modal task-editor-modal">
          <div className="task-creator-head">
            <div><h2>Edit {taskEditor.packageName} Tasks</h2><p>{taskEditor.dateKey || 'Selected task date'} · Choose one row or the complete matching plan batch.</p></div>
            <button className="ghost" onClick={() => setTaskEditor(null)}>Close</button>
          </div>
          <div className="task-edit-scope" role="group" aria-label="Edit scope">
            <button className={taskEditor.mode === 'single' ? 'primary' : 'ghost'} onClick={() => setTaskEditor((editor) => ({ ...editor, mode: 'single' }))}>Single Task</button>
            <button className={taskEditor.mode === 'batch' ? 'primary' : 'ghost'} onClick={() => setTaskEditor((editor) => ({ ...editor, mode: 'batch' }))}>Complete Plan Batch ({taskEditor.rows.length})</button>
          </div>
          <div className="task-creator-table-wrap">
            <table className="task-creator-table"><thead><tr><th>#</th><th>Title</th><th>Platform</th><th>Task URL</th><th>Instructions</th><th>Reward</th><th>Status</th></tr></thead><tbody>
              {(taskEditor.mode === 'batch' ? taskEditor.rows : taskEditor.rows.filter((row) => row.id === taskEditor.anchorId)).map((row, index) => (
                <tr key={row.id}><td>{index + 1}</td><td><input value={row.title} onChange={(event) => updateEditorRow(row.id, 'title', event.target.value)} /></td><td><select value={row.platform} onChange={(event) => updateEditorRow(row.id, 'platform', event.target.value)}>{['youtube','instagram','facebook','google','website','whatsapp','banner','local','other'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input value={row.taskUrl} onChange={(event) => updateEditorRow(row.id, 'taskUrl', event.target.value)} /></td><td><textarea value={row.description} onChange={(event) => updateEditorRow(row.id, 'description', event.target.value)} /></td><td><input type="number" step="0.01" value={row.rewardAmount} readOnly title="Automatically fixed for this plan" /></td><td><select value={row.status} onChange={(event) => updateEditorRow(row.id, 'status', event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option></select></td></tr>
              ))}
            </tbody></table>
          </div>
          <div className="task-creator-actions"><button className="ghost" onClick={() => setTaskEditor(null)}>Cancel</button><button className="primary" onClick={saveTaskEditor}>Save {taskEditor.mode === 'batch' ? `${taskEditor.rows.length} Tasks` : 'Task'}</button></div>
        </div>
      </div>
    )}
    </>
  );
}

function WithdrawalsPage({ withdrawals, onRefresh }) {
  async function decide(id, action) {
    const transactionNumber = action === 'paid' ? window.prompt('Transaction reference number') : '';
    await api.put(`/withdrawals/admin/${id}/${action}`, action === 'paid' ? { transactionNumber, adminRemarks: 'Amount credited' } : { adminRemarks: action });
    onRefresh();
  }

  return (
    <Panel title="Withdrawal Desk" icon={Wallet}>
      <DataTable
        columns={['Customer', 'Requested Amount', 'Request Date', 'Status', 'Payment Date', 'Transaction Number', 'Approval History', 'Action']}
        rows={withdrawals.map((item) => [
          item.user?.name || 'Member',
          money(item.amount),
          item.requestDate ? new Date(item.requestDate).toLocaleString() : '-',
          <Badge tone={item.statusColor === 'green' ? 'green' : item.statusColor === 'red' ? 'coral' : item.statusColor === 'blue' ? 'blue' : 'gold'}>{item.statusLabel || item.status}</Badge>,
          item.paymentDate ? new Date(item.paymentDate).toLocaleString() : '-',
          item.transactionReferenceNumber || item.transactionNumber || '-',
          <div className="timeline-list">
            {(item.timeline || item.approvalHistory || []).map((step, index) => (
              <span className={`badge ${step.color === 'green' ? 'green' : step.color === 'red' ? 'coral' : step.color === 'blue' ? 'blue' : 'gold'}`} key={`${step.status}-${step.updatedAt || index}`}>
                {step.label || step.status} · {step.updatedAt ? new Date(step.updatedAt).toLocaleString() : '-'}{step.updatedBy?.name ? ` · ${step.updatedBy.name}` : ''}
              </span>
            ))}
          </div>,
          <div className="row-actions">
            <button className="mini approve" onClick={() => decide(item.id, 'approve')} disabled={item.status !== 'pending'}>Approve</button>
            <button className="mini processing-action" onClick={() => decide(item.id, 'processing')} disabled={item.status !== 'approved'}>Processing</button>
            <button className="mini paid-action" onClick={() => decide(item.id, 'paid')} disabled={item.status !== 'processing'}>Paid</button>
            <button className="mini reject" onClick={() => decide(item.id, 'reject')} disabled={!['pending', 'approved', 'processing'].includes(item.status)}>Reject</button>
          </div>
        ])}
        empty="No withdrawal requests."
      />
    </Panel>
  );
}

function SupportPage({ tickets }) {
  return (
    <Panel title="Support Tickets" icon={Ticket}>
      <DataTable
        columns={['User', 'Subject', 'Priority', 'Status']}
        rows={tickets.map((ticket) => [
          ticket.user?.name || 'Member',
          ticket.subject,
          <Badge tone={ticket.priority === 'high' ? 'coral' : 'gold'}>{ticket.priority}</Badge>,
          <Badge tone={ticket.status === 'closed' ? 'green' : 'gold'}>{ticket.status}</Badge>
        ])}
        empty="No support tickets."
      />
    </Panel>
  );
}

function ReportPanel({ title, icon, columns, rows, empty }) {
  const Icon = icon;
  return (
    <Panel
      title={title}
      icon={Icon}
      action={rows.length ? (
        <div className="report-actions">
          <button className="mini" onClick={() => exportExcel(title, columns, rows)}>Excel</button>
          <button className="mini" onClick={() => exportPdf(title, columns, rows)}>PDF</button>
        </div>
      ) : null}
    >
      <DataTable columns={columns} rows={rows} empty={empty || 'No records found.'} />
    </Panel>
  );
}

function ReportsPage({ reports }) {
  const [filters, setFilters] = useState({ customer: '', date: '', plan: '', status: '', transactionType: '' });
  const dailyRows = (reports.dailyBusiness || []).map((item) => [
    item.date,
    item.registrations,
    money(item.collectionAmount),
    money(item.distributedAmount),
    money(item.paidWithdrawalAmount),
    money(item.profitAmount)
  ]);
  const packageRows = (reports.packagePerformance || []).map((item) => [
    item.packageName,
    item.registrations,
    money(item.collectionAmount)
  ]);
  const distributionRows = (reports.distributionReport || []).map((item) => [
    item.type,
    money(item.amount)
  ]);
  const withdrawalRows = (reports.withdrawalReport || []).map((item) => [
    item.status,
    item.count,
    money(item.amount)
  ]);
  const allTransactions = reports.transactions || reports.recentTransactions || [];
  const planOptions = [...new Set(allTransactions.map((item) => item.plan?.name).filter(Boolean))];
  const filteredTransactions = allTransactions
    .filter((item) => !filters.customer || `${item.customer?.name || ''} ${item.customer?.email || ''} ${item.customer?.mobile || ''}`.toLowerCase().includes(filters.customer.toLowerCase()))
    .filter((item) => !filters.date || item.date === filters.date || String(item.createdAt || '').startsWith(filters.date))
    .filter((item) => !filters.plan || item.plan?.name === filters.plan)
    .filter((item) => !filters.status || item.status === filters.status || item.type === filters.status)
    .filter((item) => !filters.transactionType || item.transactionType === filters.transactionType || item.category === filters.transactionType);
  const transactionRows = filteredTransactions.map((item) => [
    item.date && item.time ? `${item.date} ${item.time}` : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'),
    item.customer?.name || '-',
    item.transactionType || item.category,
    item.status || item.type,
    money(item.amount),
    item.remarks || '-'
  ]);

  return (
    <div className="page-grid">
      <Panel title="Profit Snapshot" icon={FileBarChart}>
        <div className="profit-grid">
          <div><span>Total Collection</span><strong>{money(reports.profitSnapshot?.totalCollection)}</strong></div>
          <div><span>Rewards Distributed</span><strong>{money(reports.profitSnapshot?.totalDistributed)}</strong></div>
          <div><span>Current Profit Zone</span><strong>{money(reports.profitSnapshot?.profitAmount)}</strong></div>
          <div><span>Cash After Paid Withdrawals</span><strong>{money(reports.profitSnapshot?.cashAfterPaidWithdrawals)}</strong></div>
        </div>
      </Panel>
      <ReportPanel
        title="Daily Registration, Collection and Distribution Report"
        icon={BadgeIndianRupee}
        columns={['Date', 'Registrations', 'Collected', 'Rewards Distributed', 'Withdrawals Paid', 'Profit Zone']}
        rows={dailyRows}
        empty="No daily business records yet."
      />
      <div className="two-col">
        <ReportPanel
          title="Package Collection Report"
          icon={Boxes}
          columns={['Package', 'Approved Registrations', 'Collected Amount']}
          rows={packageRows}
          empty="No package collection records yet."
        />
        <ReportPanel
          title="Reward Distribution Report"
          icon={Wallet}
          columns={['Reward Type', 'Distributed Amount']}
          rows={distributionRows}
          empty="No reward distribution records yet."
        />
      </div>
      <div className="two-col">
        <ReportPanel
          title="Withdrawal Status Report"
          icon={FileBarChart}
          columns={['Status', 'Count', 'Amount']}
          rows={withdrawalRows}
          empty="No withdrawal records yet."
        />
        <Panel title="Transaction Filters" icon={SlidersHorizontal}>
          <div className="form-grid">
            <input placeholder="Customer" value={filters.customer} onChange={(e) => setFilters({ ...filters, customer: e.target.value })} />
            <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            <select value={filters.plan} onChange={(e) => setFilters({ ...filters, plan: e.target.value })}>
              <option value="">All Plans</option>
              {planOptions.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              {['pending', 'approved', 'submitted', 'completed', 'paid', 'rejected', 'credit', 'debit'].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select value={filters.transactionType} onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}>
              <option value="">All Types</option>
              {['subscription_payment', 'advertisement_earning', 'referral_earning', 'withdrawal_request', 'task_income', 'referral_income', 'withdrawal'].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </Panel>
      </div>
      <div className="two-col">
        <ReportPanel
          title="Complete Transaction History"
          icon={CreditCard}
          columns={['Date', 'Customer', 'Type', 'Status', 'Amount', 'Remarks']}
          rows={transactionRows}
          empty="No transactions yet."
        />
      </div>
    </div>
  );
}

function ContentPage({ banners, onRefresh }) {
  const emptyBanner = { title: '', imageUrl: '', linkUrl: '', placement: 'home', status: 'active' };
  const [banner, setBanner] = useState(emptyBanner);
  const [bannerFile, setBannerFile] = useState(null);
  const [editingBannerId, setEditingBannerId] = useState('');

  async function createBanner(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', banner.title);
    formData.append('imageUrl', banner.imageUrl);
    formData.append('linkUrl', banner.linkUrl);
    formData.append('placement', banner.placement);
    formData.append('status', banner.status);
    if (bannerFile) formData.append('image', bannerFile);
    if (editingBannerId) {
      await api.put(`/admin/banners/${editingBannerId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setBanner(emptyBanner);
    setBannerFile(null);
    setEditingBannerId('');
    onRefresh();
  }

  function editBanner(item) {
    setEditingBannerId(item.id);
    setBanner({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      placement: item.placement || 'home',
      status: item.status || 'active'
    });
  }

  return (
    <div className="two-col">
      <Panel title="Banners" icon={Image}>
        <DataTable
          columns={['Preview', 'Title', 'Placement', 'Status', 'Action']}
          rows={banners.map((item) => [
            item.imageUrl ? <img className="banner-preview" src={absoluteAssetUrl(item.imageUrl)} alt={item.title} /> : '-',
            item.title,
            item.placement,
            <Badge tone={item.status === 'active' ? 'green' : 'gold'}>{item.status}</Badge>,
            <div className="row-actions">
              <button className="mini" onClick={() => editBanner(item)}>Edit</button>
              <button className="mini" onClick={async () => { await api.put(`/admin/banners/${item.id}`, { status: item.status === 'active' ? 'inactive' : 'active' }); onRefresh(); }}>Status</button>
              <button className="mini reject" onClick={async () => { if (window.confirm(`Delete ${item.title}?`)) { await api.delete(`/admin/banners/${item.id}`); onRefresh(); } }}>Delete</button>
            </div>
          ])}
          empty="No banners yet."
        />
      </Panel>
      <Panel title={editingBannerId ? 'Edit Banner' : 'Create Banner'} icon={UploadCloud}>
        <form className="stack" onSubmit={createBanner}>
          <input required placeholder="Banner title" value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} />
          <input placeholder="Image URL" value={banner.imageUrl} onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
          <input placeholder="Link URL" value={banner.linkUrl} onChange={(e) => setBanner({ ...banner, linkUrl: e.target.value })} />
          <select value={banner.placement} onChange={(e) => setBanner({ ...banner, placement: e.target.value })}><option value="home">Home</option><option value="dashboard">Dashboard</option><option value="promotion">Promotion</option><option value="mobile">Mobile</option></select>
          <select value={banner.status} onChange={(e) => setBanner({ ...banner, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <button className="primary">{editingBannerId ? 'Update Banner' : 'Save Banner'}</button>
          {editingBannerId && <button type="button" className="ghost" onClick={() => { setEditingBannerId(''); setBanner(emptyBanner); }}>Cancel Edit</button>}
        </form>
      </Panel>
    </div>
  );
}

function NotificationsPage({ users }) {
  const [notification, setNotification] = useState({ title: '', body: '', type: 'general', userId: '', targetScope: 'all' });
  const [items, setItems] = useState([]);

  async function loadNotifications() {
    const response = await api.get('/admin/notifications');
    setItems(response.data.notifications || []);
  }

  useEffect(() => {
    loadNotifications().catch(() => setItems([]));
  }, []);

  async function broadcast(event) {
    event.preventDefault();
    const payload = {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      targetScope: notification.type === 'general' ? 'all' : notification.targetScope,
      userId: notification.type === 'general' ? null : notification.userId
    };
    await api.post('/admin/notifications', payload);
    setNotification({ title: '', body: '', type: 'general', userId: '', targetScope: 'all' });
    await loadNotifications();
  }

  return (
    <div className="two-col">
      <Panel title="Push Notifications" icon={Bell}>
        <p>Notifications appear on mobile lock screen and in app alerts. Members receive real-time chat reminders and promotional messages.</p>
        <DataTable
          columns={['Title', 'Message', 'Type', 'Target', 'Date']}
          rows={items.map((item) => [
            item.title,
            item.body,
            <Badge tone={item.type === 'task' ? 'green' : 'gold'}>{item.type}</Badge>,
            item.user?.name || (item.userId ? 'Selected member' : 'All members'),
            item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'
          ])}
          empty="No notifications sent yet."
        />
      </Panel>
      <Panel title="Send Push Notification" icon={Bell}>
        <form className="notification-form" onSubmit={broadcast}>
          <input required placeholder="Title" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} />
          <textarea required placeholder="Message body" value={notification.body} onChange={(e) => setNotification({ ...notification, body: e.target.value })} />
          <select value={notification.type} onChange={(e) => setNotification({ ...notification, type: e.target.value, targetScope: e.target.value === 'general' ? 'all' : 'user_line' })}><option value="general">General</option><option value="task">Task Reminder</option><option value="payment">Payment Alert</option><option value="withdrawal">Withdrawal Update</option><option value="income">Income Credit</option></select>
          {notification.type !== 'general' && (
            <>
              <select required value={notification.userId} onChange={(e) => setNotification({ ...notification, userId: e.target.value })}>
                <option value="">Select member</option>
                {(users || []).map((user) => <option key={user.id} value={user.id}>{user.name} · {user.mobile || user.email}</option>)}
              </select>
              <select value={notification.targetScope} onChange={(e) => setNotification({ ...notification, targetScope: e.target.value })}>
                <option value="user_line">Selected member and line</option>
                <option value="user">Selected member only</option>
              </select>
            </>
          )}
          <button className="primary">Send Notification</button>
        </form>
      </Panel>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <span><Icon size={18} /></span>
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function DataTable({ columns, rows, empty }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          )) : (
            <tr><td colSpan={columns.length}><Empty text={empty} /></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ tone = 'green', children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function SearchBox() {
  return <label className="search"><Search size={16} /><input placeholder="Search" /></label>;
}

function ActionPair({ onApprove, onReject, disabled }) {
  return (
    <div className="row-actions">
      <button className="mini approve" onClick={onApprove} disabled={disabled}><CheckCircle2 size={14} /> Approve</button>
      <button className="mini reject" onClick={onReject} disabled={disabled}><XCircle size={14} /> Reject</button>
    </div>
  );
}

function QueueRow({ label, value, tone }) {
  return (
    <div className="queue-row">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <ChevronRight size={17} />
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}
