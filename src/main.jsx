import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import {
  ArrowRight,
  BadgeIndianRupee,
  Banknote,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Contact,
  Copy,
  Facebook,
  Gift,
  Globe2,
  Headphones,
  Home,
  Instagram,
  Landmark,
  Layers3,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageCircle,
  PlayCircle,
  ReceiptText,
  Send,
  ShieldCheck,
  TreePine,
  Upload,
  Wallet,
  X
} from 'lucide-react';
import './styles.css';
import logo from './images/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BRAND_NAME = 'Luminateads';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luminateads_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const demoPackages = [
  { id: 'pkg-1', name: '1K Package', baseAmount: 999, taxAmount: 125, finalAmount: 1124, minAdsRequired: 0, freeBannerCount: 0 },
  { id: 'pkg-2', name: '2K Package', baseAmount: 1999, taxAmount: 125, finalAmount: 2124, minAdsRequired: 0, freeBannerCount: 1 },
  { id: 'pkg-3', name: '3K Package', baseAmount: 2999, taxAmount: 125, finalAmount: 3124, minAdsRequired: 0, freeBannerCount: 2 }
];

const demoTasks = [
  { id: 'task-1', title: 'Watch a brand video', platform: 'youtube', rewardAmount: 25, description: 'Spend a few minutes with a featured brand video and share your completion screen.', taskUrl: 'https://youtube.com' },
  { id: 'task-2', title: 'Share a social poster', platform: 'whatsapp', rewardAmount: 15, description: 'Help a local campaign reach more people by sharing its poster.', taskUrl: 'https://whatsapp.com' },
  { id: 'task-3', title: 'Follow a launch page', platform: 'instagram', rewardAmount: 20, description: 'Support a new campaign page and share your completion screen.', taskUrl: 'https://instagram.com' }
];

const services = [
  ['Advertising Promotion', 'TV, banners, YouTube, newspaper, and social media advertising.'],
  ['Digital Marketing', 'Instagram, Facebook, Google, WhatsApp, and website promotion.'],
  ['Brand Promotion', 'Make a company name, logo, and offer more visible locally.'],
  ['Sales Promotion', 'Campaigns for offers, cashback, discounts, and launches.'],
  ['Event Promotion', 'Promote openings, exhibitions, events, and public programs.'],
  ['Referral Promotion', 'Grow through users sharing offers with trusted networks.'],
  ['Influencer Promotion', 'Collaborate with creators and social profiles.'],
  ['Local Area Promotion', 'Pamphlets, banners, announcements, and neighborhood outreach.']
];

const calendarDays = Array.from({ length: 30 }, (_, index) => ({
  day: index + 1,
  status: index < 11 ? 'completed' : index === 11 ? 'progress' : index < 15 ? 'missed' : 'pending',
  count: 10 + (index % 6)
}));

function useApiData(path, fallback, mapper = (x) => x) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get(path)
      .then((res) => mounted && setData(mapper(res.data)))
      .catch(() => mounted && setData(fallback))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [path]);

  return { data, loading, setData };
}

function App() {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentPackage, setPaymentPackage] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('luminateads_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('luminateads_user') || 'null'));
  const [notice, setNotice] = useState('');
  const packages = useApiData('/packages', demoPackages, (data) => data.packages || demoPackages);
  const tasks = useApiData('/tasks', demoTasks, (data) => data.tasks || demoTasks);
  const wallet = useApiData('/wallet', { wallet: { totalEarned: 0, availableBalance: 0, withdrawnAmount: 0 }, transactions: [] }, (data) => data);

  const isLoggedIn = Boolean(token);
  const navItems = [
    ['home', 'Home'],
    ['services', 'Services'],
    ['packages', 'Packages'],
    ['portal', 'Dashboard'],
    ['profile', 'Profile'],
    ['tasks', 'Tasks'],
    ['hierarchy', 'Hierarchy'],
    ['wallet', 'Wallet'],
    ['support', 'Support']
  ];

  function saveSession(payload) {
    localStorage.setItem('luminateads_token', payload.token);
    localStorage.setItem('luminateads_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
    setAuthOpen(false);
    setActive('packages');
    setNotice(`Welcome to ${BRAND_NAME}. Choose a package to continue.`);
  }

  function logout() {
    localStorage.removeItem('luminateads_token');
    localStorage.removeItem('luminateads_user');
    setToken(null);
    setUser(null);
    setActive('home');
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setActive('home')}>
          <img className="brand-logo" src={logo} alt="Luminateads" />
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          {navItems.map(([key, label]) => (
            <button key={key} className={active === key ? 'active' : ''} onClick={() => { setActive(key); setMenuOpen(false); }}>
              {label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {isLoggedIn ? (
            <>
              <button className="icon-btn" title="Notifications"><Bell size={18} /></button>
              <button className="ghost" onClick={logout}><LogOut size={17} /> Logout</button>
            </>
          ) : (
            <button className="primary" onClick={() => setAuthOpen(true)}>Login / Register</button>
          )}
          <button className="icon-btn menu" onClick={() => setMenuOpen(!menuOpen)} title="Menu"><Menu size={20} /></button>
        </div>
      </header>

      {notice && <div className="toast" onAnimationEnd={() => setNotice('')}>{notice}</div>}

      <main>
        {active === 'home' && <HomePage setActive={setActive} setAuthOpen={setAuthOpen} />}
        {active === 'services' && <ServicesPage />}
        {active === 'packages' && <PackagesPage packages={packages.data} setAuthOpen={setAuthOpen} isLoggedIn={isLoggedIn} setPaymentPackage={setPaymentPackage} />}
        {active === 'portal' && <Dashboard user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setActive={setActive} packages={packages.data} wallet={wallet.data} />}
        {active === 'profile' && <ProfilePage user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
        {active === 'tasks' && <TasksPage tasks={tasks.data} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} />}
        {active === 'hierarchy' && <HierarchyPage user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} />}
        {active === 'wallet' && <WalletPage wallet={wallet.data} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
        {active === 'support' && <SupportPage isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img className="footer-logo" src={logo} alt="Luminateads" />
            <p>Smart ads, brighter results. A structured advertising and referral platform for daily ad tasks, hierarchy growth, and admin-managed payouts.</p>
          </div>
          <div className="footer-col">
            <strong>Platform</strong>
            <button onClick={() => setActive('packages')}>Packages</button>
            <button onClick={() => setActive('tasks')}>Daily Tasks</button>
            <button onClick={() => setActive('hierarchy')}>Hierarchy</button>
          </div>
          <div className="footer-col">
            <strong>Account</strong>
            <button onClick={() => setActive('profile')}>Profile</button>
            <button onClick={() => setActive('wallet')}>Wallet</button>
            <button onClick={() => setActive('support')}>Support</button>
          </div>
          <div className="footer-col">
            <strong>Support</strong>
            <span>Payments and approvals</span>
            <span>Bank change permission</span>
            <span>Task proof review</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Luminateads. All rights reserved.</span>
          <div>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSession={saveSession} packages={packages.data} />}
      {paymentPackage && <PaymentModal pkg={paymentPackage} onClose={() => setPaymentPackage(null)} setNotice={setNotice} />}
    </div>
  );
}

function HomePage({ setActive, setAuthOpen }) {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content reveal">
          <span className="eyebrow"><ShieldCheck size={16} /> Smart ads brighter results</span>
          <h1>Luminateads</h1>
          <p>Join a structured advertising platform where members select a package, complete daily ad tasks, build referral hierarchy, and receive weekly or monthly payouts managed by the company.</p>
          <div className="hero-actions">
            <button className="primary large" onClick={() => setAuthOpen(true)}>Start as Member <ArrowRight size={18} /></button>
            <button className="glass" onClick={() => setActive('packages')}>See Plans</button>
          </div>
        </div>
      </section>

      <section className="metrics band">
        {[
          ['Simple Activities', 'Watch, follow, share, visit, review, and promote.'],
          ['Invite & Grow', 'Share your code with friends and build your circle.'],
          ['Rewards in One Place', 'See your earnings, history, and request money easily.'],
          ['Clear Tracking', 'Every activity and request stays visible in your account.']
        ].map(([title, text]) => (
          <article className="metric" key={title}>
            <CheckCircle2 size={22} />
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </section>

      <section className="section split">
        <div>
          <span className="section-kicker">How it works</span>
          <h2>Start small, share often, and grow steadily.</h2>
          <p className="muted">Create your account with basic details, choose a plan, add referral information at the final step, complete daily ads, and follow your payout status clearly.</p>
        </div>
        <div className="timeline">
          {['Create Account', 'Choose Plan', 'Add Referral', 'Complete Daily Ads', 'Track Calendar', 'Receive Payout'].map((step, index) => (
            <div className="timeline-row" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ServicesPage() {
  return (
    <section className="section">
      <span className="section-kicker">Services</span>
      <h2>Ways you can help advertisers reach more people.</h2>
      <div className="service-grid">
        {services.map(([title, text], index) => (
          <article className="service-card" key={title} style={{ animationDelay: `${index * 40}ms` }}>
            <span className="service-icon">{index % 3 === 0 ? <Globe2 /> : index % 3 === 1 ? <Instagram /> : <Facebook />}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PackagesPage({ packages, isLoggedIn, setAuthOpen, setPaymentPackage }) {
  return (
    <section className="section">
      <span className="section-kicker">Packages</span>
      <h2>Choose a plan and continue your Luminateads journey.</h2>
      <div className="package-grid">
        {packages.map((pkg, index) => (
          <article className={index === 1 ? 'package-card featured' : 'package-card'} key={pkg.id}>
            <div className="package-top">
              <span>{pkg.name}</span>
              {index === 1 && <em>Popular</em>}
            </div>
            <strong>{money(pkg.finalAmount)}</strong>
            <p>Base {money(pkg.baseAmount)} + tax {money(pkg.taxAmount)}</p>
            <ul>
              <li><CheckCircle2 size={16} /> Your own invite code</li>
              <li><CheckCircle2 size={16} /> Daily earning activities</li>
              <li><CheckCircle2 size={16} /> {pkg.freeBannerCount || 0} free banner credits</li>
            </ul>
            <button className="primary full" onClick={() => isLoggedIn ? setPaymentPackage(pkg) : setAuthOpen(true)}>
              {isLoggedIn ? 'Continue with this plan' : 'Login to Continue'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Dashboard({ user, isLoggedIn, setAuthOpen, setActive, packages, wallet }) {
  if (!isLoggedIn) return <Gate title="Your personal space is waiting." text="Login or register to see your plan, invite code, activities, rewards, and support in one place." action={setAuthOpen} />;

  const stats = [
    ['Available Rewards', money(wallet.wallet?.availableBalance), Wallet],
    ['Total Rewards', money(wallet.wallet?.totalEarned), BadgeIndianRupee],
    ['Invite Code', user?.referralCode || 'Pending', TreePine],
    ['Current Plan', user?.package?.name || packages[0]?.name || 'Not selected', Layers3]
  ];

  return (
    <section className="section portal">
      <div className="portal-head">
        <div>
          <span className="section-kicker">Customer Portal</span>
          <h2>Welcome, {user?.name || 'Member'}.</h2>
        </div>
          <button className="primary" onClick={() => setActive('tasks')}>Today’s Activities <ChevronRight size={18} /></button>
      </div>
      <div className="stat-grid">
        {stats.map(([label, value, Icon]) => (
          <article className="stat-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="portal-grid">
        <article className="panel">
          <h3>Invite Friends</h3>
          <div className="referral-box">
            <code>{user?.referralCode || 'ILLUXXXX'}</code>
            <button className="icon-btn" title="Copy referral code"><Copy size={17} /></button>
          </div>
          <div className="share-row">
            <button><MessageCircle size={17} /> WhatsApp</button>
            <button><Send size={17} /> Telegram</button>
            <button><LinkIcon size={17} /> Copy Link</button>
          </div>
        </article>
        <article className="panel">
          <h3>Getting Started</h3>
          {['Profile completed', 'Plan selected', 'Account activated', 'Bank details added'].map((item, index) => (
            <div className="check-row" key={item}>
              <span className={index < 2 ? 'done' : ''}><CheckCircle2 size={16} /></span>
              {item}
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}

function ProfilePage({ user, isLoggedIn, setAuthOpen, setNotice }) {
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '' });
  const [photo, setPhoto] = useState('');

  if (!isLoggedIn) return <Gate title="Your profile is protected." text="Login to edit personal information, manage your photo, and submit secure bank details." action={setAuthOpen} />;

  async function saveProfile() {
    await api.put('/auth/profile', profile);
    setNotice('Profile information updated.');
  }

  return (
    <section className="section">
      <span className="section-kicker">Profile</span>
      <h2>Personal information and account security.</h2>
      <div className="profile-grid">
        <article className="panel">
          <h3>Profile Photo</h3>
          <div className="avatar-preview">{photo ? <img src={photo} alt="Profile preview" /> : <Contact size={42} />}</div>
          <label className="file-field">
            <Upload size={18} /> Upload photo
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }} />
          </label>
        </article>
        <article className="panel">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <input placeholder="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input placeholder="Email address" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <input placeholder="Mobile number" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
            <input type="password" placeholder="New password request" />
          </div>
          <button className="primary" onClick={saveProfile}>Save Profile</button>
        </article>
      </div>
    </section>
  );
}

function HierarchyPage({ user, isLoggedIn, setAuthOpen }) {
  if (!isLoggedIn) return <Gate title="Your referral structure starts here." text="Login to view upline, downline, referral levels, team count, and earning structure." action={setAuthOpen} />;

  const levels = [
    ['Level 1', 'Direct referrals', '10%'],
    ['Level 2', 'Second level team', '5%'],
    ['Level 3', 'Third level team', '3%'],
    ['Level 4', 'Fourth level team', '1%'],
    ['Level 5', 'Company managed', '0%']
  ];

  return (
    <section className="section">
      <span className="section-kicker">Hierarchy</span>
      <h2>Referral tree and team structure.</h2>
      <div className="hierarchy-grid">
        <article className="panel hierarchy-card">
          <TreePine size={30} />
          <h3>{user?.name || 'Member'}</h3>
          <p className="muted">Referral code: <strong>{user?.referralCode || 'Assigned after activation'}</strong></p>
          <div className="tree-lines">
            <span>Upline: Company/Admin referral when no manual ID is entered</span>
            <span>Downline: Updates as members join with your referral code</span>
            <span>Team count: Visible after approvals and package activation</span>
          </div>
        </article>
        <article className="panel">
          <h3>Earning Levels</h3>
          {levels.map(([level, label, percent]) => (
            <div className="transaction-row" key={level}>
              <span>{level} · {label}</span>
              <strong>{percent}</strong>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}

function TasksPage({ tasks, isLoggedIn, setAuthOpen }) {
  if (!isLoggedIn) return <Gate title="Daily ad activities unlock payouts." text="Login to see date-wise assignments, complete daily ads, and submit proof with remarks." action={setAuthOpen} />;

  return (
    <section className="section">
      <span className="section-kicker">Activities</span>
      <h2>Monthly calendar-based ad tasks.</h2>
      <div className="calendar-grid">
        {calendarDays.map((item) => (
          <button className={`calendar-day ${item.status}`} key={item.day}>
            <strong>{item.day}</strong>
            <span>{item.status}</span>
            <small>{item.count} ads</small>
          </button>
        ))}
      </div>
      <p className="muted task-policy">Complete 10 to 15 assigned ads each day. Missed dates are marked red and may affect weekly or monthly payout calculations.</p>
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard task={task} key={task.id} />
        ))}
      </div>
    </section>
  );
}

function TaskCard({ task }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('notes', notes);
      await api.post(`/tasks/${task.id}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Submitted successfully. We will update you soon.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="task-card">
            <span className="task-icon">{task.platform === 'youtube' ? <PlayCircle /> : task.platform === 'whatsapp' ? <MessageCircle /> : <ClipboardCheck />}</span>
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>{task.platform} · status {progress >= 100 ? 'completed' : progress > 0 ? 'in progress' : 'pending'}</small>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <input placeholder="Remarks after watching ads" value={notes} onChange={(e) => setNotes(e.target.value)} />
              {message && <small className="form-note">{message}</small>}
            </div>
            <div className="task-actions">
              <button className="ghost" onClick={() => setProgress((value) => Math.min(100, value + 25))}>Play / Track</button>
              <a className="ghost" href={task.taskUrl || '#'} target="_blank" rel="noreferrer">Open Link</a>
              <label className="upload-btn">
                <Upload size={17} /> {busy ? 'Uploading' : 'Upload'}
                <input type="file" onChange={(e) => upload(e.target.files?.[0])} />
              </label>
            </div>
    </article>
  );
}

function WalletPage({ wallet, isLoggedIn, setAuthOpen, setNotice }) {
  const [bank, setBank] = useState({ bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '', panNumber: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  if (!isLoggedIn) return <Gate title="Your rewards stay organized." text="Login to see your balance, save bank or UPI details, and request money when you are ready." action={setAuthOpen} />;

  async function saveBank() {
    try {
      await api.put('/wallet/bank-details', bank);
      setNotice('Bank details saved and locked for security.');
    } catch (err) {
      setNotice(err.response?.data?.message || 'Admin permission is required to edit bank details.');
    }
  }

  async function requestWithdrawal() {
    await api.post('/withdrawals/request', { amount: Number(withdrawAmount) });
    setWithdrawAmount('');
    setNotice('Your request has been submitted.');
  }

  return (
    <section className="section">
      <span className="section-kicker">Rewards</span>
      <h2>Referral and task earnings are merged into one payout balance.</h2>
      <div className="wallet-layout">
        <article className="balance-panel">
          <Wallet size={28} />
          <span>Combined Balance</span>
          <strong>{money(wallet.wallet?.availableBalance)}</strong>
          <small>Daily task income is credited by admin during weekly or monthly payout processing.</small>
          <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount to request" />
          <button className="primary" onClick={requestWithdrawal}>Request Money</button>
        </article>
        <article className="panel">
          <h3>Bank / UPI Details</h3>
          <p className="muted">Bank details can be submitted once. Later changes require admin approval.</p>
          <div className="form-grid">
            <input placeholder="Bank name" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
            <input placeholder="Account holder name" value={bank.accountHolderName} onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })} />
            <input placeholder="Account number" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
            <input placeholder="IFSC code" value={bank.ifscCode} onChange={(e) => setBank({ ...bank, ifscCode: e.target.value })} />
            <input placeholder="UPI ID" value={bank.upiId} onChange={(e) => setBank({ ...bank, upiId: e.target.value })} />
            <input placeholder="PAN number" value={bank.panNumber} onChange={(e) => setBank({ ...bank, panNumber: e.target.value })} />
          </div>
          <button className="ghost" onClick={saveBank}>Save Details</button>
        </article>
      </div>
      <div className="panel">
        <h3>Recent Transactions</h3>
        {(wallet.transactions || []).length ? wallet.transactions.map((tx) => (
          <div className="transaction-row" key={tx.id}>
            <span>{tx.category}</span>
            <strong>{money(tx.amount)}</strong>
          </div>
        )) : <p className="muted">No activity yet. Your rewards and requests will appear here.</p>}
      </div>
    </section>
  );
}

function SupportPage({ isLoggedIn, setAuthOpen, setNotice }) {
  const [ticket, setTicket] = useState({ subject: '', message: '', priority: 'medium' });
  if (!isLoggedIn) return <Gate title="Need help? We are here." text="Login to send your question and follow replies from the support team." action={setAuthOpen} />;

  async function submitTicket() {
    await api.post('/support', ticket);
    setTicket({ subject: '', message: '', priority: 'medium' });
    setNotice('Support ticket submitted.');
  }

  return (
    <section className="section support">
      <span className="section-kicker">Support</span>
      <h2>Raise a ticket with the support team.</h2>
      <div className="support-grid">
        <article className="panel">
          <h3>New Ticket</h3>
          <input placeholder="Subject" value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} />
          <textarea placeholder="Describe the issue" value={ticket.message} onChange={(e) => setTicket({ ...ticket, message: e.target.value })} />
          <select value={ticket.priority} onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}><option value="medium">Medium priority</option><option value="high">High priority</option><option value="low">Low priority</option></select>
          <button className="primary" onClick={submitTicket}>Submit Ticket</button>
        </article>
        <article className="contact-panel">
          <Headphones size={30} />
          <h3>24x7 Complaint Tracking</h3>
          <p>Questions about plans, rewards, activities, invites, or profile details can be sent here.</p>
        </article>
      </div>
    </section>
  );
}

function PaymentModal({ pkg, onClose, setNotice }) {
  const [utrNumber, setUtrNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData();
    formData.append('packageId', pkg.id);
    formData.append('paymentMode', 'manual');
    if (referralCode) formData.append('referralCode', referralCode);
    if (utrNumber) formData.append('utrNumber', utrNumber);
    if (file) formData.append('screenshot', file);
    await api.post('/payments/upload-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setBusy(false);
    setNotice('Your payment details have been submitted.');
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <span className="section-kicker">Plan Payment</span>
        <h2>{pkg.name} · {money(pkg.finalAmount)}</h2>
        <p className="muted">Enter a referral ID at this final step. If left blank, the company/admin referral account will be assigned.</p>
        <form onSubmit={submit}>
          <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Referral ID optional" />
          <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="UTR / transaction number" />
          <label className="file-field">
            <Upload size={18} /> {file ? file.name : 'Upload screenshot or receipt'}
            <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
          </label>
          <button className="primary full" disabled={busy}>{busy ? 'Submitting...' : 'Submit Payment Details'}</button>
        </form>
      </div>
    </div>
  );
}

function Gate({ title, text, action }) {
  return (
    <section className="section gate">
      <div className="gate-card">
        <ShieldCheck size={34} />
        <h2>{title}</h2>
        <p>{text}</p>
        <button className="primary" onClick={action}>Login / Register</button>
      </div>
    </section>
  );
}

function AuthModal({ onClose, onSession, packages }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', identifier: '', referralCode: '', packageId: packages[0]?.id || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = mode === 'login'
        ? { identifier: form.identifier, password: form.password }
        : { name: form.name, email: form.email, mobile: form.mobile, password: form.password };
      const res = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      onSession(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete request. Please check details.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <span className="section-kicker">{mode === 'login' ? 'Welcome back' : 'Create account'}</span>
        <h2>{mode === 'login' ? 'Login to Luminateads' : 'Create your Luminateads account'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required placeholder="Mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <p className="muted">Package and referral ID are collected after registration.</p>
            </>
          )}
          {mode === 'login' && (
            <input required placeholder="Email or mobile" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          )}
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <button className="text-link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create a new account' : 'I already have an account'}
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
