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
  Eye,
  EyeOff,
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
import heroFallbackImage from './images/mlm-main.jpg';
import heroAdsPlatformImage from './images/hero-ads-platform.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BRAND_NAME = 'Luminate Ads';
const PAYMENT_QR_IMAGE = import.meta.env.VITE_PAYMENT_QR_IMAGE || paymentQrImage;
const PAYMENT_UPI_ID = import.meta.env.VITE_PAYMENT_UPI_ID || '';
const PAYMENT_PAYEE_NAME = import.meta.env.VITE_PAYMENT_PAYEE_NAME || 'LASYA PROMOTERS';
const PAYMENT_TERMINAL = 'Terminal 3-Q155769084';
const SUPPORT_WHATSAPP = '919000424489';
const SUPPORT_TELEGRAM = 'https://t.me/LuminateAds';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luminateads_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('luminateads_token');
      localStorage.removeItem('luminateads_user');
      window.dispatchEvent(new Event('luminateads-session-expired'));
    }
    return Promise.reject(error);
  }
);

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const progressSyncCache = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function taskIdOf(taskOrId) {
  return typeof taskOrId === 'object' ? taskOrId?.id : taskOrId;
}

function taskProgressKey(userId, taskOrId, date = todayKey()) {
  const taskId = taskIdOf(taskOrId);
  return `luminateads_task_progress_${userId || 'guest'}_${date}_${taskId}`;
}

function readTaskProgress(userId, taskOrId, date = todayKey()) {
  const serverProgress = typeof taskOrId === 'object' ? taskOrId?.progress : null;
  const serverPercent = Number(serverProgress?.percent || 0);
  const serverSeconds = Number(serverProgress?.seconds || 0);
  try {
    const localProgress = JSON.parse(localStorage.getItem(taskProgressKey(userId, taskOrId, date)) || '{"percent":0,"seconds":0}');
    return {
      ...serverProgress,
      ...localProgress,
      percent: Math.max(serverPercent, Number(localProgress.percent || 0)),
      seconds: Math.max(serverSeconds, Number(localProgress.seconds || 0))
    };
  } catch {
    return { ...(serverProgress || {}), percent: serverPercent, seconds: serverSeconds };
  }
}

function saveTaskProgress(userId, taskId, progress) {
  if (!userId || !taskId) return;
  const current = readTaskProgress(userId, taskId);
  const next = {
    percent: Math.max(Number(current.percent || 0), Number(progress.percent || 0)),
    seconds: Math.max(Number(current.seconds || 0), Number(progress.seconds || 0)),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(taskProgressKey(userId, taskId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('luminateads-task-progress', { detail: { userId, taskId, progress: next } }));
  syncTaskProgress(userId, taskId, next);
}

function syncTaskProgress(userId, taskId, progress, date = todayKey()) {
  const key = `${userId}_${taskId}_${date}`;
  const last = progressSyncCache.get(key);
  const now = Date.now();
  const percent = Number(progress.percent || 0);
  if (percent < 100 && last && now - last.time < 5000 && percent - last.percent < 5) return;
  progressSyncCache.set(key, { time: now, percent });
  api.put(`/tasks/${taskId}/progress`, {
    percent,
    seconds: Number(progress.seconds || 0),
    taskDate: date
  }).catch(() => {
    progressSyncCache.delete(key);
  });
}

function getTaskProgressSummary(userId, tasks = []) {
  const rows = tasks.map((task) => ({ task, progress: readTaskProgress(userId, task) }));
  const total = rows.length;
  const completed = rows.filter((row) => Number(row.progress.percent || 0) >= 100).length;
  const pending = Math.max(total - completed, 0);
  const average = total ? Math.round(rows.reduce((sum, row) => sum + Number(row.progress.percent || 0), 0) / total) : 0;
  return { rows, total, completed, pending, average };
}

const demoPackages = [
  { id: 'pkg-1', name: '₹999 Plan', baseAmount: 999, taxAmount: 125, finalAmount: 1124, minAdsRequired: 15, dailyAdsRequired: 15, dailyWorkMinutes: 30, monthlyGenerationAmount: 300, dailyDebitAmount: 10, freeBannerCount: 1 },
  { id: 'pkg-2', name: '₹1,999 Plan', baseAmount: 1999, taxAmount: 125, finalAmount: 2124, minAdsRequired: 30, dailyAdsRequired: 30, dailyWorkMinutes: 60, monthlyGenerationAmount: 500, dailyDebitAmount: 16.67, freeBannerCount: 2 },
  { id: 'pkg-3', name: '₹2,999 Plan', baseAmount: 2999, taxAmount: 125, finalAmount: 3124, minAdsRequired: 60, dailyAdsRequired: 60, dailyWorkMinutes: 120, monthlyGenerationAmount: 700, dailyDebitAmount: 23.33, freeBannerCount: 3 }
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

function absoluteAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL.replace(/\/api$/, '')}${path}`;
}

function referralLink(code) {
  const url = new URL(window.location.href);
  url.searchParams.set('ref', code || '');
  return url.toString();
}

function shareText(code) {
  return `Join Luminate Ads with my referral code ${code}. ${referralLink(code)}`;
}

function dailyAds(pkg) {
  return Number(pkg.dailyAdsRequired || pkg.minAdsRequired || 0);
}

function dailyIncome(pkg) {
  return Number(pkg.monthlyGenerationAmount || 0) / 30;
}

function perAdValue(pkg) {
  const ads = dailyAds(pkg);
  return ads ? dailyIncome(pkg) / ads : 0;
}

function todayBalance(walletData) {
  const today = new Date().toISOString().slice(0, 10);
  return (walletData?.transactions || [])
    .filter((tx) => {
      const createdDate = String(tx.createdAt || tx.updatedAt || '').slice(0, 10);
      return createdDate === today && tx.type === 'credit';
    })
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
}

function currentUserLevel(user) {
  return user?.currentLevel || user?.levelName || user?.rank || user?.level || 'Beginner';
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
    if (!path) {
      setData(fallback);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    api.get(path, { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
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
  const [authOpen, setAuthOpen] = useState(() => Boolean(new URLSearchParams(window.location.search).get('ref')));
  const [paymentPackage, setPaymentPackage] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('luminateads_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('luminateads_user') || 'null'));
  const [notice, setNotice] = useState('');
  const isLoggedIn = Boolean(token);
  const packages = useApiData('/packages', demoPackages, (data) => data.packages || demoPackages);
  const tasks = useApiData(isLoggedIn ? '/tasks' : null, demoTasks, (data) => data.tasks || demoTasks);
  const wallet = useApiData(isLoggedIn ? '/wallet' : null, { wallet: { totalEarned: 0, availableBalance: 0, withdrawnAmount: 0 }, transactions: [] }, (data) => data);
  const publicHome = useApiData('/public/home', { banners: [], packages: demoPackages, latestTasks: demoTasks }, (data) => data);

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
    setActive('portal');
    setNotice(`Welcome to ${BRAND_NAME}. Your dashboard is ready.`);
  }

  function updateStoredUser(nextUser) {
    localStorage.setItem('luminateads_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem('luminateads_token');
    localStorage.removeItem('luminateads_user');
    setToken(null);
    setUser(null);
    setActive('home');
  }

  useEffect(() => {
    function handleExpiredSession() {
      setToken(null);
      setUser(null);
      setActive('home');
      setNotice('Session expired. Please login again.');
    }
    window.addEventListener('luminateads-session-expired', handleExpiredSession);
    return () => window.removeEventListener('luminateads-session-expired', handleExpiredSession);
  }, []);

  useEffect(() => {
    if (!token || !['portal', 'profile', 'tasks', 'wallet'].includes(active)) return undefined;
    let mounted = true;
    api.get('/auth/profile')
      .then((res) => {
        if (mounted && res.data.user) updateStoredUser(res.data.user);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [token, active]);

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
        {active === 'home' && <HomePage setActive={setActive} setAuthOpen={setAuthOpen} banners={publicHome.data.banners || []} />}
        {active === 'services' && <ServicesPage />}
        {active === 'packages' && <PackagesPage packages={packages.data} setAuthOpen={setAuthOpen} isLoggedIn={isLoggedIn} setPaymentPackage={setPaymentPackage} />}
        {active === 'portal' && <Dashboard user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setActive={setActive} packages={packages.data} wallet={wallet.data} tasks={tasks.data} />}
        {active === 'profile' && <ProfilePage user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} onUserUpdate={updateStoredUser} />}
        {active === 'tasks' && <TasksPage tasks={tasks.data} packages={packages.data} user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} />}
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

function HomePage({ setActive, setAuthOpen, banners = [] }) {
  const heroSlides = banners.length
    ? banners
    : [
        { id: 'fallback-hero-main', title: 'Luminate Ads', imageUrl: heroFallbackImage, local: true },
        { id: 'fallback-hero-ads', title: 'Daily advertising tasks', imageUrl: heroAdsPlatformImage, local: true }
      ];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      <section className="hero slider-hero">
        {heroSlides.map((slide, index) => {
          const slideImage = slide.local ? slide.imageUrl : absoluteAssetUrl(slide.imageUrl);
          return slideImage ? (
            <img
              className={index === slideIndex ? 'hero-slide-image active' : 'hero-slide-image'}
              src={slideImage}
              alt={slide.title || 'Luminate Ads'}
              key={slide.id || slide.imageUrl || index}
            />
          ) : null;
        })}
        <div className="hero-content reveal">
          <span className="eyebrow"><ShieldCheck size={16} /> Smart ads brighter results</span>
          <h1>Luminate Ads</h1>
          <p>Join a structured advertising platform where members select a package, complete daily ad tasks, build referral hierarchy, and receive weekly or monthly payouts managed by the company.</p>
          <div className="hero-actions">
            <button className="primary large" onClick={() => setAuthOpen(true)}>Start as Member <ArrowRight size={18} /></button>
            <button className="glass" onClick={() => setActive('packages')}>See Plans</button>
          </div>
        </div>
        {heroSlides.length > 1 && (
          <div className="hero-dots" aria-label="Home banner slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id || slide.imageUrl || index}
                className={index === slideIndex ? 'active' : ''}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setSlideIndex(index)}
              />
            ))}
          </div>
        )}
      </section>

      <BannerScroller banners={banners} />

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

function BannerScroller({ banners }) {
  if (!banners.length) return null;
  return (
    <section className="banner-strip">
      {banners.map((banner) => (
        <a className="home-banner" key={banner.id} href={banner.linkUrl || '#'} target={banner.linkUrl ? '_blank' : undefined} rel="noreferrer">
          <img src={absoluteAssetUrl(banner.imageUrl)} alt={banner.title} />
          <span>{banner.title}</span>
        </a>
      ))}
    </section>
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
            <p>{dailyAds(pkg)} ads daily · {pkg.dailyWorkMinutes || 0} minutes · {money(pkg.monthlyGenerationAmount)} monthly generation.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Approx daily income {money(dailyIncome(pkg))}</li>
              <li><CheckCircle2 size={16} /> Per ad value {money(perAdValue(pkg))}</li>
              <li><CheckCircle2 size={16} /> Missed day debit {money(pkg.dailyDebitAmount)}</li>
            </ul>
            <button className="primary full" onClick={() => isLoggedIn ? setPaymentPackage(pkg) : setAuthOpen(true)}>
              {isLoggedIn ? 'Continue with this plan' : 'Login to Continue'}
            </button>
          </article>
        ))}
      </div>
      <DailyAdIncomePlan packages={packages} />
      <ReferralIncomePlan />
    </section>
  );
}

function DailyAdIncomePlan({ packages }) {
  return (
    <div className="income-plan">
      <div className="income-plan-head">
        <div>
          <span className="section-kicker">Daily Advertisement Task Income Plan</span>
          <h2>Complete daily ads to protect monthly generation.</h2>
        </div>
      </div>
      <div className="commission-table panel">
        <div className="commission-header">
          <span>Plan</span>
          <span>Daily Work</span>
          <span>Monthly</span>
        </div>
        {packages.map((pkg) => (
          <div className="commission-row" key={pkg.id}>
            <span>{pkg.name} · {dailyAds(pkg)} ads</span>
            <strong>{pkg.dailyWorkMinutes || 0} min</strong>
            <strong>{money(pkg.monthlyGenerationAmount)}</strong>
          </div>
        ))}
        <div className="commission-total">
          <span>Missing a full daily assignment creates an automatic debit.</span>
          <strong>Daily debit as per plan</strong>
        </div>
      </div>
    </div>
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
      </div>
    </div>
  );
}

function Dashboard({ user, isLoggedIn, setAuthOpen, setActive, packages, wallet, tasks = [] }) {
  const [progressVersion, setProgressVersion] = useState(0);
  useEffect(() => {
    function refreshProgress() {
      setProgressVersion((value) => value + 1);
    }
    window.addEventListener('luminateads-task-progress', refreshProgress);
    return () => window.removeEventListener('luminateads-task-progress', refreshProgress);
  }, []);

  if (!isLoggedIn) return <Gate title="Your personal space is waiting." text="Login or register to see your plan, invite code, activities, rewards, and support in one place." action={setAuthOpen} />;

  const stats = [
    ['Available Balance', money(wallet.wallet?.availableBalance), Wallet],
    ['Today Balance', money(todayBalance(wallet)), BadgeIndianRupee],
    ['Invite Code', user?.referralCode || 'Pending', TreePine],
    ['Current Level', currentUserLevel(user), Layers3]
  ];
  const progressSummary = getTaskProgressSummary(user?.id, tasks, progressVersion);
  const watchedRows = progressSummary.rows.filter((row) => Number(row.progress.percent || 0) > 0);
  const gettingStarted = [
    ['Profile completed', Boolean(user?.name && user?.mobile)],
    ['Plan selected', Boolean(user?.packageId || user?.package)],
    ['Account activated', user?.status === 'active'],
    ['Bank details added', Boolean(user?.bankDetail?.upiId || user?.bankDetail?.accountNumber || user?.upiId)]
  ];
  const code = user?.referralCode || '';
  const link = referralLink(code);

  async function copyReferral() {
    await navigator.clipboard?.writeText(link);
  }

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
            <button className="icon-btn" title="Copy referral link" onClick={copyReferral}><Copy size={17} /></button>
          </div>
          <div className="share-row">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText(code))}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join Luminate Ads with referral code ${code}`)}`} target="_blank" rel="noreferrer"><Send size={17} /> Telegram</a>
            <button onClick={copyReferral}><LinkIcon size={17} /> Copy Link</button>
          </div>
          <p className="muted">Support WhatsApp: +91 90004 24489 · Telegram: {SUPPORT_TELEGRAM}</p>
        </article>
        <article className="panel">
          <h3>Getting Started</h3>
          {gettingStarted.map(([item, done]) => (
            <div className="check-row" key={item}>
              <span className={done ? 'done' : ''}><CheckCircle2 size={16} /></span>
              {item}
            </div>
          ))}
        </article>
        <article className="panel task-summary-panel">
          <h3>Today’s Watch Progress</h3>
          <div className="task-summary-stats">
            <div><strong>{progressSummary.completed}</strong><span>Completed</span></div>
            <div><strong>{progressSummary.pending}</strong><span>Pending</span></div>
            <div><strong>{progressSummary.average}%</strong><span>Average watched</span></div>
          </div>
          <div className="progress-track"><span style={{ width: `${progressSummary.average}%` }} /></div>
          {progressSummary.total ? (
            <p className="muted">
              You watched {progressSummary.completed} of {progressSummary.total} videos completely. {progressSummary.pending ? `Continue the remaining ${progressSummary.pending} task${progressSummary.pending === 1 ? '' : 's'} to close today’s activity.` : 'Today’s activity is complete.'}
            </p>
          ) : (
            <p className="muted">No active videos are available for today yet.</p>
          )}
          {watchedRows.length > 0 && (
            <div className="task-summary-list">
              {watchedRows.slice(0, 4).map(({ task, progress }) => (
                <div key={task.id}>
                  <span>{task.title}</span>
                  <strong>{Number(progress.percent || 0)}%</strong>
                </div>
              ))}
            </div>
          )}
          <button className="ghost" onClick={() => setActive('tasks')}>Continue Today’s Activities</button>
        </article>
      </div>
    </section>
  );
}

function ProfilePage({ user, isLoggedIn, setAuthOpen, setNotice, onUserUpdate }) {
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [photo, setPhoto] = useState(() => absoluteAssetUrl(user?.avatarUrl));
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isLoggedIn) return <Gate title="Your profile is protected." text="Login to edit personal information, manage your photo, and submit secure bank details." action={setAuthOpen} />;

  function showSuccess(text) {
    setError('');
    setMessage(text);
    setNotice(text);
  }

  function showError(err, fallback) {
    const text = err?.response?.data?.message || fallback;
    setMessage('');
    setError(text);
    setNotice(text);
  }

  async function saveProfile() {
    try {
      const res = await api.put('/auth/profile', profile);
      if (res.data.user) onUserUpdate(res.data.user);
      showSuccess('Profile information updated.');
    } catch (err) {
      showError(err, 'Unable to update profile information.');
    }
  }

  async function savePhoto() {
    if (!photoFile) {
      setError('Please choose a profile photo before saving.');
      setMessage('');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const res = await api.put('/auth/profile/photo', formData);
      if (res.data.user) onUserUpdate(res.data.user);
      setPhotoFile(null);
      showSuccess('Profile photo saved.');
    } catch (err) {
      showError(err, 'Unable to save profile photo.');
    }
  }

  async function savePassword() {
    if (!passwordForm.newPassword) {
      setError('Please enter a new password.');
      setMessage('');
      return;
    }
    try {
      await api.put('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      onUserUpdate({ ...user, hasPassword: true });
      showSuccess(user?.hasPassword ? 'Password changed successfully.' : 'Password added successfully.');
    } catch (err) {
      showError(err, user?.hasPassword ? 'Unable to change password.' : 'Unable to add password.');
    }
  }

  return (
    <section className="section">
      <span className="section-kicker">Profile</span>
      <h2>Personal information and account security.</h2>
      {message && <p className="form-note success-note">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="profile-grid">
        <article className="panel">
          <h3>Profile Photo</h3>
          <div className="avatar-preview">{photo ? <img src={photo} alt="Profile preview" /> : <Contact size={42} />}</div>
          <label className="file-field">
            <Upload size={18} /> Upload photo
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPhotoFile(file);
                setPhoto(URL.createObjectURL(file));
              }
            }} />
          </label>
          <button className="ghost" onClick={savePhoto}>Save Photo</button>
        </article>
        <article className="panel">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <input placeholder="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input placeholder="Email address" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <input placeholder="Mobile number" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
          </div>
          <button className="primary" onClick={saveProfile}>Save Profile</button>
        </article>
        <article className="panel">
          <h3>{user?.hasPassword ? 'Change Password' : 'Add Password'}</h3>
          <p className="muted">Use a password to keep your account login simple and secure.</p>
          <div className="form-grid">
            {user?.hasPassword && <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />}
            <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <button className="ghost" onClick={savePassword}>{user?.hasPassword ? 'Change Password' : 'Add Password'}</button>
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
  const hasRealHierarchy = downline.length > 0;
  const treeData = hasRealHierarchy && tree ? tree : buildDemoHierarchy(user);

  return (
    <div className="profile-hierarchy">
      <span className="section-kicker">Hierarchy</span>
      <h2>{hasRealHierarchy ? 'Your referral order inside your profile.' : 'Hierarchy preview for your referral order.'}</h2>
      <div className="hierarchy-grid">
        <article className="panel hierarchy-tree-panel">
          <div className="tree-summary">
            <div>
              <h3>{hasRealHierarchy ? user?.name || 'Member' : 'Example hierarchy'}</h3>
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
          {!hasRealHierarchy && <p className="muted preview-copy">This sample shows how your hierarchy will form after members join through your referral link. Real members will replace this preview automatically.</p>}
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

function TasksPage({ tasks, packages, user, isLoggedIn, setAuthOpen }) {
  const userPlanId = user?.packageId || user?.package?.id || '';
  const [selectedPlan, setSelectedPlan] = useState(userPlanId || packages[0]?.id || '');
  const [progressVersion, setProgressVersion] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [watchLockMessage, setWatchLockMessage] = useState('');
  useEffect(() => {
    if (userPlanId && userPlanId !== selectedPlan) {
      setSelectedPlan(userPlanId);
      return;
    }
    if (!selectedPlan && packages[0]?.id) setSelectedPlan(packages[0].id);
  }, [packages, selectedPlan, userPlanId]);
  useEffect(() => {
    function refreshProgress() {
      setProgressVersion((value) => value + 1);
    }
    window.addEventListener('luminateads-task-progress', refreshProgress);
    return () => window.removeEventListener('luminateads-task-progress', refreshProgress);
  }, []);
  const progressSummary = getTaskProgressSummary(user?.id, tasks, progressVersion);
  const inProgressTask = progressSummary.rows.find((row) => Number(row.progress.percent || 0) > 0 && Number(row.progress.percent || 0) < 100);
  useEffect(() => {
    if (!activeTaskId && inProgressTask?.task?.id) {
      setActiveTaskId(inProgressTask.task.id);
      return;
    }
    if (!activeTaskId) return;
    const activeProgress = progressSummary.rows.find((row) => row.task.id === activeTaskId)?.progress;
    if (Number(activeProgress?.percent || 0) >= 100) setActiveTaskId('');
  }, [activeTaskId, inProgressTask?.task?.id, progressSummary.rows]);

  if (!isLoggedIn) return <Gate title="Daily ad activities unlock payouts." text="Login to see date-wise assignments, complete daily ads, and submit proof with remarks." action={setAuthOpen} />;
  const calendar = getMonthlyCalendar();
  const activePlan = packages.find((pkg) => pkg.id === selectedPlan) || packages[0];
  const planLabels = ['A Plan', 'B Plan', 'C Plan'];

  return (
    <section className="section">
      <span className="section-kicker">Activities</span>
      <h2>Monthly calendar-based ad tasks.</h2>
      <div className="plan-switcher" aria-label="Task plan selector">
        {packages.slice(0, 3).map((pkg, index) => (
          <button key={pkg.id} className={activePlan?.id === pkg.id ? 'active' : ''} onClick={() => setSelectedPlan(pkg.id)}>
            <strong>{planLabels[index] || pkg.name}</strong>
            <span>{pkg.name}</span>
          </button>
        ))}
      </div>
      {activePlan && <p className="muted task-plan-note">Selected view: {activePlan.name}. Admin uploaded videos appear below.</p>}
      <div className="daily-progress-panel">
        <div>
          <strong>{progressSummary.completed}/{progressSummary.total}</strong>
          <span>videos completed today</span>
        </div>
        <div>
          <strong>{progressSummary.average}%</strong>
          <span>average watched</span>
        </div>
        <p>{progressSummary.pending ? `${progressSummary.pending} video${progressSummary.pending === 1 ? '' : 's'} pending. Continue watching the remaining tasks to close today’s activity.` : 'All available videos are completed for today.'}</p>
      </div>
      {watchLockMessage && <p className="watch-lock-message">{watchLockMessage}</p>}
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
      <p className="muted task-policy">Complete the full daily ad count for your selected plan. Missed dates create an automatic daily debit as per the plan policy.</p>
      <div className="task-list">
        {tasks.length ? tasks.map((task) => (
          <TaskCard
            task={task}
            userId={user?.id}
            key={task.id}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            setWatchLockMessage={setWatchLockMessage}
          />
        )) : <p className="muted">No active tasks are available right now. New ad tasks posted by admin will appear here automatically.</p>}
      </div>
    </section>
  );
}

function TaskCard({ task, userId, activeTaskId, setActiveTaskId, setWatchLockMessage }) {
  const storedProgress = readTaskProgress(userId, task);
  const [progress, setProgress] = useState(Number(storedProgress.percent || 0));
  const [watching, setWatching] = useState(false);
  const youtubeMountRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const directVideoRef = useRef(null);
  const restoredDirectRef = useRef(false);
  const restoredYouTubeRef = useRef(false);
  const activeTaskIdRef = useRef(activeTaskId);
  const videoUrl = task.videoUrl || task.mediaUrl || task.taskUrl || '';
  const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
  const embedUrl = getEmbedUrl(videoUrl);
  const isYouTubeVideo = isYouTubeUrl(videoUrl);
  const youtubeVideoId = getYouTubeId(videoUrl);
  const canTrackYouTube = isYouTubeVideo && Boolean(youtubeVideoId);
  const isCompleted = progress >= 100;
  const isLocked = Boolean(activeTaskId && activeTaskId !== task.id && !isCompleted);

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  function requestWatchStart() {
    if (isCompleted) {
      setWatchLockMessage?.('');
      return true;
    }
    if (activeTaskIdRef.current && activeTaskIdRef.current !== task.id) {
      setWatchLockMessage?.('Finish the video already in progress before starting another task.');
      return false;
    }
    setActiveTaskId?.(task.id);
    setWatchLockMessage?.(`Continue "${task.title}" until it is fully watched. Other videos stay locked for focus.`);
    return true;
  }

  function completeWatch(seconds = 0) {
    setProgress(100);
    saveTaskProgress(userId, task.id, { percent: 100, seconds });
    setActiveTaskId?.('');
    setWatchLockMessage?.(`"${task.title}" is completed. You can start the next video now.`);
  }

  useEffect(() => {
    if (!embedUrl || !canTrackYouTube || !youtubeMountRef.current) return undefined;
    let cancelled = false;
    let progressTimer;

    function updateProgressFromPlayer() {
      const player = youtubePlayerRef.current;
      if (!player?.getDuration || !player?.getCurrentTime) return;
      const duration = player.getDuration();
      if (!duration) return;
      const currentTime = player.getCurrentTime();
      const watched = Math.min(100, Math.round((currentTime / duration) * 100));
      setProgress(watched);
      saveTaskProgress(userId, task.id, { percent: watched, seconds: currentTime });
      if (watched >= 100) clearInterval(progressTimer);
    }

    function createPlayer() {
      if (cancelled || !window.YT?.Player || !youtubeMountRef.current) return;
      youtubeMountRef.current.innerHTML = '';
      const playerElement = document.createElement('div');
      youtubeMountRef.current.appendChild(playerElement);
      youtubePlayerRef.current = new window.YT.Player(playerElement, {
        videoId: youtubeVideoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (event) => {
            const saved = readTaskProgress(userId, task);
            if (!restoredYouTubeRef.current && Number(saved.seconds || 0) > 0) {
              restoredYouTubeRef.current = true;
              event.target.seekTo(Number(saved.seconds), true);
              setProgress(Number(saved.percent || 0));
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!requestWatchStart()) {
                event.target.pauseVideo?.();
                return;
              }
              setWatching(true);
              clearInterval(progressTimer);
              progressTimer = setInterval(updateProgressFromPlayer, 500);
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              updateProgressFromPlayer();
              clearInterval(progressTimer);
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              completeWatch(event.target?.getDuration?.() || readTaskProgress(userId, task).seconds || 0);
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
      try {
        youtubePlayerRef.current?.destroy?.();
      } catch {
        // YouTube may already detach its iframe while navigating away.
      }
      youtubePlayerRef.current = null;
      if (youtubeMountRef.current) youtubeMountRef.current.innerHTML = '';
    };
  }, [canTrackYouTube, embedUrl, task.id, task.title, userId, youtubeVideoId]);

  useEffect(() => {
    if (!watching || isDirectVideo || canTrackYouTube) return undefined;
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = Math.min(100, value + 2);
        saveTaskProgress(userId, task.id, { percent: next, seconds: readTaskProgress(userId, task).seconds || 0 });
        return next;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [watching, isDirectVideo, canTrackYouTube, task.id, userId]);

  function onVideoProgress(event) {
    const video = event.currentTarget;
    if (!video.duration) return;
    const watched = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
    setProgress(watched);
    saveTaskProgress(userId, task.id, { percent: watched, seconds: video.currentTime });
  }

  function onDirectVideoPlay(event) {
    if (!requestWatchStart()) {
      event.currentTarget.pause();
      return;
    }
    setWatching(true);
  }

  function restoreDirectVideo(event) {
    if (restoredDirectRef.current) return;
    const saved = readTaskProgress(userId, task);
    if (Number(saved.seconds || 0) > 0 && event.currentTarget.duration && Number(saved.seconds) < event.currentTarget.duration) {
      event.currentTarget.currentTime = Number(saved.seconds);
      setProgress(Number(saved.percent || 0));
    }
    restoredDirectRef.current = true;
  }

  return (
    <article className="task-card">
            <span className="task-icon">{task.platform === 'youtube' ? <PlayCircle /> : task.platform === 'whatsapp' ? <MessageCircle /> : <ClipboardCheck />}</span>
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>{task.platform} · status {progress >= 100 ? 'completed' : progress > 0 ? 'in progress' : 'pending'}</small>
              <div className={`video-player ${isLocked ? 'locked' : ''}`} onClick={() => {
                if (!requestWatchStart()) return;
                setWatching(true);
                youtubePlayerRef.current?.playVideo?.();
              }}>
                {isLocked && <div className="video-lock-overlay">Finish the current video first</div>}
                {isDirectVideo ? (
                  <video ref={directVideoRef} src={videoUrl} controls onLoadedMetadata={restoreDirectVideo} onTimeUpdate={onVideoProgress} onPlay={onDirectVideoPlay} onEnded={(event) => {
                    completeWatch(event.currentTarget.duration || readTaskProgress(userId, task).seconds || 0);
                  }} />
                ) : embedUrl && canTrackYouTube ? (
                  <div className="youtube-frame" ref={youtubeMountRef} />
                ) : embedUrl ? (
                  <iframe src={embedUrl} title={task.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <div className="video-placeholder"><PlayCircle size={32} /><span>Open the activity link and track your watching progress here.</span></div>
                )}
              </div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="progress-meta"><span>{progress}% watched</span><span>{progress >= 100 ? 'Completed' : 'Watch the video to move progress'}</span></div>
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
        <p className="muted">Scan the QR, enter UTR number, and upload receipt.</p>
        <div className="payment-breakdown">
          <div><span>Package amount</span><strong>{money(baseAmount)}</strong></div>
          <div><span>GST Tax</span><strong>{money(taxAmount)}</strong></div>
          <div><span>Total payable</span><strong>{money(finalAmount)}</strong></div>
        </div>
        <div className="payment-qr-card">
          {qrSrc ? (
            <img className="payment-qr-img" src={qrSrc} alt="Payment QR code" />
          ) : (
            <div className="payment-qr-fallback" aria-label="PhonePe QR code placeholder">
              <QrCode size={112} />
              <span>Scan the official payment QR.</span>
            </div>
          )}
        </div>
        <form onSubmit={submit}>
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
  const [form, setForm] = useState(() => ({ name: '', email: '', mobile: '', password: '', confirmPassword: '', identifier: '', referralCode: new URLSearchParams(window.location.search).get('ref') || '', packageId: packages[0]?.id || '' }));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('Password and repeat password do not match.');
          setBusy(false);
          return;
        }
        const availability = await api.get('/auth/availability', { params: { email: form.email, mobile: form.mobile } });
        if (!availability.data.available) {
          setError(availability.data.message || 'This account is already registered. Please login instead.');
          setBusy(false);
          return;
        }
      }
      const payload = mode === 'login'
        ? { identifier: form.identifier, password: form.password }
        : { name: form.name, email: form.email, mobile: form.mobile, password: form.password, referralCode: form.referralCode };
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
      <div className="auth-modal auth-simple-modal">
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <img className="auth-simple-logo" src={logo} alt="Luminate Ads" />
        <div className="auth-tabs">
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setError(''); }}>Register</button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError(''); }}>Login</button>
        </div>
        <span className="section-kicker">{mode === 'login' ? 'Member Login' : 'Member Registration'}</span>
        <h2>{mode === 'login' ? 'Login to your dashboard' : 'Create your Luminate Ads account'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required placeholder="Mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <input placeholder="Referral code" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
            </>
          )}
          {mode === 'login' && (
            <input required placeholder="Email or mobile" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          )}
          <div className="password-field">
            <input required type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'register' && (
            <div className="password-field">
              <input required type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
