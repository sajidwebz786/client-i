import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Bike,
  Car,
  Crown,
  Gift,
  Gem,
  Globe2,
  Headphones,
  Home,
  House,
  Instagram,
  Landmark,
  Layers3,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageCircle,
  PlayCircle,
  QrCode,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Trophy,
  TreePine,
  Upload,
  Wallet,
  UsersRound,
  X
} from 'lucide-react';
import './styles.css';
import logo from './images/logo.png';
import paymentQrImage from './images/qrcode.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BRAND_NAME = 'Luminate Ads';
const PAYMENT_QR_IMAGE = import.meta.env.VITE_PAYMENT_QR_IMAGE || paymentQrImage;
const PAYMENT_UPI_ID = import.meta.env.VITE_PAYMENT_UPI_ID || '';
const PAYMENT_PAYEE_NAME = import.meta.env.VITE_PAYMENT_PAYEE_NAME || 'Luminateads';
const PAYMENT_TERMINAL = 'Terminal 1-Q32970111';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luminateads_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const demoPackages = [
  { id: 'pkg-1', name: '1K Package', baseAmount: 999, taxAmount: 125, finalAmount: 1124, minAdsRequired: 0, freeBannerCount: 1 },
  { id: 'pkg-2', name: '2K Package', baseAmount: 1999, taxAmount: 125, finalAmount: 2124, minAdsRequired: 0, freeBannerCount: 2 },
  { id: 'pkg-3', name: '3K Package', baseAmount: 2999, taxAmount: 125, finalAmount: 3124, minAdsRequired: 0, freeBannerCount: 3 }
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

function getMonthlyCalendar(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push({ key: `blank-start-${i}`, blank: true });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const status = day < date.getDate() - 1 ? 'completed' : day === date.getDate() ? 'progress' : day < date.getDate() ? 'missed' : 'pending';
    days.push({ key: `${year}-${month}-${day}`, day, status, count: 10 + (day % 6) });
  }

  while (days.length % 7 !== 0) {
    days.push({ key: `blank-end-${days.length}`, blank: true });
  }

  return {
    title: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    days
  };
}

function packageTax(pkg) {
  return Number(pkg.taxAmount || 0);
}

function packageBaseAmount(pkg) {
  return Number(pkg.baseAmount || 0);
}

function packageFinalAmount(pkg) {
  return Number(pkg.finalAmount || packageBaseAmount(pkg) + packageTax(pkg));
}

const commissionLevels = [
  { level: 1, percent: 10, amount999: 99.9, label: 'Direct Referral' },
  { level: 2, percent: 5, amount999: 49.95, label: 'Level 2 Team' },
  { level: 3, percent: 3, amount999: 29.97, label: 'Level 3 Team' },
  { level: 4, percent: 1, amount999: 9.99, label: 'Level 4 Team' },
  { level: 5, percent: 1, amount999: 9.99, label: 'Level 5 Team' },
  { level: 6, percent: 1, amount999: 9.99, label: 'Level 6 Team' },
  { level: 7, percent: 1, amount999: 9.99, label: 'Level 7 Team' },
  { level: 8, percent: 1, amount999: 9.99, label: 'Level 8 Team' },
  { level: 9, percent: 1, amount999: 9.99, label: 'Level 9 Team' },
  { level: 10, percent: 1, amount999: 9.99, label: 'Level 10 Team' }
];

const achievementClubs = [
  { name: 'Bronze Club', members: '1,000 members', benefit: 'Mobile, fridge, AC, TV, or any electric item', Icon: Smartphone },
  { name: 'Silver Club', members: '10,000 members', benefit: 'Bike benefit', Icon: Bike },
  { name: 'Gold Club', members: '1,00,000 members', benefit: 'Car benefit', Icon: Car },
  { name: 'Platinum Club', members: '10,00,000 members', benefit: 'House flat or ₹25 lakh benefit', Icon: House },
  { name: 'Diamond Club', members: '100,00,000 members', benefit: 'Villa flat benefit', Icon: Gem }
];

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
          <img className="brand-logo" src={logo} alt="Luminate Ads" />
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
        {active === 'wallet' && <WalletPage wallet={wallet.data} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
        {active === 'support' && <SupportPage isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img className="footer-logo" src={logo} alt="Luminate Ads" />
            <p>Smart ads, brighter results. A structured advertising and referral platform for daily ad tasks, hierarchy growth, and admin-managed payouts.</p>
          </div>
          <div className="footer-col">
            <strong>Platform</strong>
            <button onClick={() => setActive('packages')}>Packages</button>
            <button onClick={() => setActive('tasks')}>Daily Tasks</button>
            <button onClick={() => setActive('profile')}>Hierarchy</button>
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
          <span>© 2026 Luminate Ads. All rights reserved.</span>
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
          <h1>Luminate Ads</h1>
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
      <h2>Choose a plan and continue your Luminate Ads journey.</h2>
      <div className="package-grid">
        {packages.map((pkg, index) => (
          <article className={index === 1 ? 'package-card featured' : 'package-card'} key={pkg.id}>
            <div className="package-top">
              <span>{pkg.name}</span>
              {index === 1 && <em>Popular</em>}
            </div>
            <strong>{money(packageBaseAmount(pkg))}</strong>
            <p>Package amount. Tax is added only on the payment screen.</p>
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
      <ReferralIncomePlan />
    </section>
  );
}

function ReferralIncomePlan() {
  return (
    <div className="income-plan">
      <div className="income-plan-head">
        <div>
          <span className="section-kicker">Direct Referral Income Plan</span>
          <h2>Earn up to level 10 from active referrals.</h2>
        </div>
        <div className="joining-card">
          <BadgeIndianRupee size={24} />
          <span>Joining Amount</span>
          <strong>₹999</strong>
          <small>Direct referral income 10% = ₹99.90</small>
        </div>
      </div>
      <div className="income-layout">
        <article className="panel">
          <h3>How It Works</h3>
          {[
            'Invite a member directly and receive 10% after approval.',
            'When your referred member invites others, income is paid by level.',
            'Income is paid up to Level 10 as per the commission structure.',
            'If someone joins without a referral, income goes to the admin / office wallet automatically.'
          ].map((text, index) => (
            <div className="plan-step" key={text}>
              <span>{index + 1}</span>
              <p>{text}</p>
            </div>
          ))}
        </article>
        <article className="level-chain">
          <div className="level-person">
            <Contact size={34} />
            <strong>You</strong>
            <span>Main invite member</span>
          </div>
          {commissionLevels.map((item) => (
            <div className="chain-row" key={item.level}>
              <span>{item.level}</span>
              <div>
                <strong>Level {item.level}</strong>
                <small>{item.level === 1 ? 'Direct Referral' : `Earn ${item.percent}%`}</small>
              </div>
            </div>
          ))}
        </article>
        <article className="panel commission-table">
          <h3>Level Wise Commission Structure</h3>
          <div className="commission-header">
            <span>Level</span>
            <span>Commission</span>
            <span>From ₹999</span>
          </div>
          {commissionLevels.map((item) => (
            <div className="commission-row" key={item.level}>
              <span>Level {item.level}</span>
              <strong>{item.percent}%</strong>
              <strong>{money(item.amount999)}</strong>
            </div>
          ))}
          <div className="commission-total">
            <span>Total max earning up to level 10</span>
            <strong>25% · ₹249.75</strong>
          </div>
        </article>
      </div>
    </div>
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
      <HierarchyPanel user={user} />
    </section>
  );
}

function HierarchyPanel({ user }) {
  const [downline, setDownline] = useState([]);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.get('/referrals/downline'),
      api.get('/referrals/tree?depth=4')
    ])
      .then(([downlineRes, treeRes]) => {
        if (!mounted) return;
        setDownline(downlineRes.status === 'fulfilled' ? downlineRes.value.data.referrals || [] : []);
        setTree(treeRes.status === 'fulfilled' ? treeRes.value.data.tree : null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const directCount = downline.filter((item) => item.level === 1).length;
  const treeData = tree || buildDemoHierarchy(user);

  return (
    <div className="profile-hierarchy">
      <span className="section-kicker">Hierarchy</span>
      <h2>Your referral order inside your profile.</h2>
      <div className="hierarchy-grid">
        <article className="panel hierarchy-tree-panel">
          <div className="tree-summary">
            <div>
              <h3>{user?.name || 'Member'}</h3>
              <p className="muted">Referral code: <strong>{user?.referralCode || 'Assigned after activation'}</strong></p>
            </div>
            <div>
              <span>Direct Team</span>
              <strong>{directCount}</strong>
            </div>
            <div>
              <span>Total Hierarchy</span>
              <strong>{loading ? '...' : downline.length}</strong>
            </div>
          </div>
          <HierarchyTree node={treeData} root />
        </article>
        <article className="panel">
          <h3>Earning Levels</h3>
          {commissionLevels.map((item) => (
            <div className="transaction-row" key={item.level}>
              <span>Level {item.level} · {item.label}</span>
              <strong>{item.percent}%</strong>
            </div>
          ))}
        </article>
        <article className="panel hierarchy-list">
          <h3>Hierarchy Order</h3>
          {downline.length ? downline.map((item) => (
            <div className="transaction-row" key={item.id}>
              <span>Level {item.level} · {item.child?.name || 'Member'}</span>
              <strong>{item.child?.referralCode || '-'}</strong>
            </div>
          )) : <p className="muted">Your hierarchy will appear here when members join using your invite code.</p>}
        </article>
      </div>
    </div>
  );
}

function buildDemoHierarchy(user) {
  return {
    name: user?.name || 'You',
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
        {root ? <Contact size={28} /> : <span>{node?.referralCode || '?'}</span>}
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

function TasksPage({ tasks, isLoggedIn, setAuthOpen }) {
  if (!isLoggedIn) return <Gate title="Daily ad activities unlock payouts." text="Login to see date-wise assignments, complete daily ads, and submit proof with remarks." action={setAuthOpen} />;
  const calendar = getMonthlyCalendar();

  return (
    <section className="section">
      <span className="section-kicker">Activities</span>
      <h2>Monthly calendar-based ad tasks.</h2>
      <div className="calendar-shell">
        <div className="calendar-head">
          <strong>{calendar.title}</strong>
          <span>Daily activity tracker</span>
        </div>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendar-grid">
          {calendar.days.map((item) => (
            item.blank ? (
              <span className="calendar-day blank" key={item.key} />
            ) : (
              <button className={`calendar-day ${item.status}`} key={item.key}>
                <strong>{item.day}</strong>
                <span>{item.status}</span>
                <small>{item.count} ads</small>
              </button>
            )
          ))}
        </div>
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
  const [watching, setWatching] = useState(false);
  const youtubeMountRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const videoUrl = task.videoUrl || task.mediaUrl || task.taskUrl || '';
  const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
  const embedUrl = getEmbedUrl(videoUrl);
  const isYouTubeVideo = isYouTubeUrl(videoUrl);
  const youtubeVideoId = getYouTubeId(videoUrl);
  const canTrackYouTube = isYouTubeVideo && Boolean(youtubeVideoId);

  useEffect(() => {
    if (!embedUrl || !canTrackYouTube || !youtubeMountRef.current) return undefined;
    let cancelled = false;
    let progressTimer;

    function updateProgressFromPlayer() {
      const player = youtubePlayerRef.current;
      if (!player?.getDuration || !player?.getCurrentTime) return;
      const duration = player.getDuration();
      if (!duration) return;
      const watched = Math.min(100, Math.round((player.getCurrentTime() / duration) * 100));
      setProgress(watched);
      if (watched >= 100) clearInterval(progressTimer);
    }

    function createPlayer() {
      if (cancelled || !window.YT?.Player || !youtubeMountRef.current) return;
      youtubePlayerRef.current = new window.YT.Player(youtubeMountRef.current, {
        videoId: youtubeVideoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setWatching(true);
              clearInterval(progressTimer);
              progressTimer = setInterval(updateProgressFromPlayer, 500);
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              updateProgressFromPlayer();
              clearInterval(progressTimer);
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              setProgress(100);
              clearInterval(progressTimer);
            }
          }
        }
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      clearInterval(progressTimer);
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [canTrackYouTube, embedUrl, youtubeVideoId]);

  useEffect(() => {
    if (!watching || isDirectVideo || canTrackYouTube) return undefined;
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, value + 2);
      });
    }, 900);
    return () => clearInterval(timer);
  }, [watching, isDirectVideo, canTrackYouTube]);

  function onVideoProgress(event) {
    const video = event.currentTarget;
    if (!video.duration) return;
    setProgress(Math.min(100, Math.round((video.currentTime / video.duration) * 100)));
  }

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
              <div className="video-player">
                {isDirectVideo ? (
                  <video src={videoUrl} controls onTimeUpdate={onVideoProgress} onPlay={() => setWatching(true)} onEnded={() => setProgress(100)} />
                ) : embedUrl && canTrackYouTube ? (
                  <div className="youtube-frame" ref={youtubeMountRef} />
                ) : embedUrl ? (
                  <iframe src={embedUrl} title={task.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <div className="video-placeholder"><PlayCircle size={32} /><span>Open the activity link and track your watching progress here.</span></div>
                )}
              </div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="progress-meta"><span>{progress}% watched</span><span>{progress >= 100 ? 'Ready to submit' : 'Complete the video before uploading'}</span></div>
              <input placeholder="Remarks after watching ads" value={notes} onChange={(e) => setNotes(e.target.value)} />
              {message && <small className="form-note">{message}</small>}
            </div>
            <div className="task-actions">
              <button className="ghost" onClick={() => {
                setWatching(true);
                youtubePlayerRef.current?.playVideo?.();
              }}>Start Progress</button>
              <a className="ghost" href={task.taskUrl || '#'} target="_blank" rel="noreferrer">Open Link</a>
              {progress >= 100 && (
                <label className="upload-btn">
                  <Upload size={17} /> {busy ? 'Uploading' : 'Upload'}
                  <input type="file" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
              )}
            </div>
    </article>
  );
}

function getEmbedUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    return '';
  } catch {
    return '';
  }
}

function isYouTubeUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes('youtube.com') || hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      if (parsed.pathname.includes('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      return parsed.searchParams.get('v') || '';
    }
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '').split('/')[0];
  } catch {
    return '';
  }
  return '';
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
      <LevelAchievements />
    </section>
  );
}

function LevelAchievements() {
  return (
    <div className="achievements">
      <div className="achievement-head">
        <div>
          <span className="section-kicker">Level Achievements</span>
          <h2>Monthly benefits for team growth milestones.</h2>
        </div>
        <div className="gift-rule">
          <Gift size={24} />
          <strong>Benefit One</strong>
          <span>Within one month, 50 direct references get a ₹10,000 worth gift.</span>
        </div>
      </div>
      <div className="achievement-grid">
        {achievementClubs.map(({ name, members, benefit, Icon }) => (
          <article className="achievement-card" key={name}>
            <Icon size={26} />
            <span>{members}</span>
            <strong>{name}</strong>
            <p>{benefit}</p>
          </article>
        ))}
      </div>
    </div>
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
  const baseAmount = packageBaseAmount(pkg);
  const taxAmount = packageTax(pkg);
  const finalAmount = packageFinalAmount(pkg);
  const qrSrc = getPaymentQrSrc(finalAmount);

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
        <h2>{pkg.name}</h2>
        <p className="muted">Enter a referral ID at this final step. If left blank, the company/admin referral account will be assigned.</p>
        <div className="payment-breakdown">
          <div><span>Package amount</span><strong>{money(baseAmount)}</strong></div>
          <div><span>Tax</span><strong>{money(taxAmount)}</strong></div>
          <div><span>Total payable</span><strong>{money(finalAmount)}</strong></div>
        </div>
        <div className="payment-qr-card">
          <div className="phonepe-brand">
            <span>पे</span>
            <strong>PhonePe</strong>
          </div>
          <div className="qr-payee">Luminateads</div>
          {qrSrc ? (
            <img className="payment-qr-img" src={qrSrc} alt="PhonePe payment QR code for Luminateads" />
          ) : (
            <div className="payment-qr-fallback" aria-label="PhonePe QR code placeholder">
              <QrCode size={112} />
              <span>Scan the official payment QR provided by Luminate Ads.</span>
            </div>
          )}
          <div className="upi-row">
            <span>BHIM UPI</span>
            <strong>{PAYMENT_TERMINAL}</strong>
          </div>
        </div>
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

function getPaymentQrSrc(amount) {
  if (PAYMENT_QR_IMAGE) return PAYMENT_QR_IMAGE;
  if (!PAYMENT_UPI_ID) return '';
  const params = new URLSearchParams({
    pa: PAYMENT_UPI_ID,
    pn: PAYMENT_PAYEE_NAME,
    am: String(Number(amount || 0)),
    cu: 'INR',
    tn: `${BRAND_NAME} package payment`
  });
  const upiUrl = `upi://pay?${params.toString()}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(upiUrl)}`;
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
        <h2>{mode === 'login' ? 'Login to Luminate Ads' : 'Create your Luminate Ads account'}</h2>
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
