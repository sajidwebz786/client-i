import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
import heroAdsPlatformImage from './images/hero-ads-platform.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BRAND_NAME = 'Luminate Ads';
const PAYMENT_QR_IMAGE = import.meta.env.VITE_PAYMENT_QR_IMAGE || paymentQrImage;
const PAYMENT_UPI_ID = import.meta.env.VITE_PAYMENT_UPI_ID || '';
const PAYMENT_PAYEE_NAME = import.meta.env.VITE_PAYMENT_PAYEE_NAME || 'LASYA PROMOTERS';
const PAYMENT_TERMINAL = 'Terminal 3-Q155769084';
const SUPPORT_WHATSAPP = '919000424489';
const SUPPORT_TELEGRAM = 'https://t.me/+KUJdU-6N4HE2ZWY1';
const AdminApp = React.lazy(() => import('./AdminApp.jsx'));

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
const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
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
  }).then(() => {
    if (percent >= 100) {
      window.dispatchEvent(new CustomEvent('luminateads-wallet-refresh'));
    }
  }).catch(() => {
    progressSyncCache.delete(key);
  });
}

function getTaskProgressSummary(userId, tasks = [], targetCount = tasks.length) {
  const rows = tasks.map((task) => ({ task, progress: readTaskProgress(userId, task) }));
  const total = Math.max(Number(targetCount || 0), rows.length);
  const completed = rows.filter((row) => Number(row.progress.percent || 0) >= 100).length;
  const pending = Math.max(total - completed, 0);
  const average = total ? Math.round(rows.reduce((sum, row) => sum + Number(row.progress.percent || 0), 0) / total) : 0;
  return { rows, total, completed, pending, average };
}

const demoPackages = [
  { id: 'pkg-1', name: '₹999 Plan', baseAmount: 999, taxAmount: 125, finalAmount: 1124, minAdsRequired: 20, dailyAdsRequired: 20, earningPerAdvertisement: 0.5, dailyWorkMinutes: 30, monthlyGenerationAmount: 300, dailyDebitAmount: 10, freeBannerCount: 1 },
  { id: 'pkg-2', name: '₹1,999 Plan', baseAmount: 1999, taxAmount: 125, finalAmount: 2124, minAdsRequired: 20, dailyAdsRequired: 20, earningPerAdvertisement: 1, dailyWorkMinutes: 60, monthlyGenerationAmount: 600, dailyDebitAmount: 20, freeBannerCount: 2 },
  { id: 'pkg-3', name: '₹2,999 Plan', baseAmount: 2999, taxAmount: 125, finalAmount: 3124, minAdsRequired: 20, dailyAdsRequired: 20, earningPerAdvertisement: 1.5, dailyWorkMinutes: 120, monthlyGenerationAmount: 900, dailyDebitAmount: 30, freeBannerCount: 3 }
];

const demoTasks = [
  { id: 'task-1', title: 'Complete a brand task', platform: 'youtube', rewardAmount: 25, description: 'Spend a few minutes with a featured brand task and share your completion screen.', taskUrl: 'https://youtube.com' },
  { id: 'task-2', title: 'Share a social poster', platform: 'whatsapp', rewardAmount: 15, description: 'Help a local campaign reach more people by sharing its poster.', taskUrl: 'https://whatsapp.com' },
  { id: 'task-3', title: 'Follow a launch page', platform: 'instagram', rewardAmount: 20, description: 'Support a new campaign page and share your completion screen.', taskUrl: 'https://instagram.com' }
];

const freeTaskPlan = {
  id: 'free-ads',
  name: 'Free Ads',
  totalAdvertisements: 10,
  dailyAdsRequired: 10,
  earningPerAdvertisement: 0.5,
  monthlyGenerationAmount: 150
};

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

function getMonthlyCalendar(date = new Date(), allocatedCount = 0, completedToday = 0) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const dailyCount = Number(allocatedCount || 0);
  const completedCount = Math.min(Number(completedToday || 0), dailyCount);

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push({ key: `blank-start-${i}`, blank: true });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const isToday = day === date.getDate();
    const status = day < date.getDate() - 1 ? 'completed' : isToday ? (dailyCount && completedCount >= dailyCount ? 'completed' : 'progress') : day < date.getDate() ? 'missed' : 'pending';
    days.push({
      key: `${year}-${month}-${day}`,
      day,
      status,
      count: dailyCount,
      completedCount: isToday ? completedCount : status === 'completed' ? dailyCount : 0,
      remainingCount: isToday ? Math.max(dailyCount - completedCount, 0) : dailyCount
    });
  }

  while (days.length % 7 !== 0) {
    days.push({ key: `blank-end-${days.length}`, blank: true });
  }

  return {
    title: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    days
  };
}

function calendarStatusLabel(status) {
  return {
    completed: 'Done',
    progress: 'Today',
    missed: 'Missed',
    pending: 'Upcoming'
  }[status] || 'Upcoming';
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
  return Number(pkg.totalAdvertisements || pkg.dailyAdsRequired || pkg.minAdsRequired || 0);
}

function dailyTargetForPlans(plans = [], fallbackCount = 0) {
  const target = plans.reduce((sum, pkg) => sum + dailyAds(pkg), 0);
  return target || fallbackCount;
}

function dailyTargetForUserTasks(user, tasks = [], packages = []) {
  const sortedPackages = sortPackagesByAmount(packages);
  const packageIds = new Set(tasks.map(taskPackageId).filter(Boolean));
  const userPlanId = user?.packageId || user?.package?.id || '';
  if (userPlanId) packageIds.add(userPlanId);
  const targetPlans = sortedPackages.filter((pkg) => packageIds.has(pkg.id));
  if (!targetPlans.length && user?.package) targetPlans.push(user.package);
  return dailyTargetForPlans(targetPlans, tasks.length);
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

function packageAmount(pkg) {
  return Number(pkg?.baseAmount || pkg?.finalAmount || 0);
}

function sortPackagesByAmount(packages = []) {
  return [...packages].sort((a, b) => packageAmount(a) - packageAmount(b));
}

function taskPackageId(task) {
  return task?.packageId || task?.package?.id || '';
}

function sortTasksByPlan(tasks = [], packages = []) {
  const amountByPackageId = new Map(packages.map((pkg) => [pkg.id, packageAmount(pkg)]));
  return [...tasks].sort((a, b) => {
    const amountA = amountByPackageId.get(taskPackageId(a)) ?? Number(a.package?.baseAmount || Number.MAX_SAFE_INTEGER);
    const amountB = amountByPackageId.get(taskPackageId(b)) ?? Number(b.package?.baseAmount || Number.MAX_SAFE_INTEGER);
    if (amountA !== amountB) return amountA - amountB;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
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
  const value = user?.currentLevel || user?.levelName || user?.rank || user?.level;
  return value ? String(value) : 'Beginner Level';
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
  { level: 1, name: 'Beginner Level', members: 'New member', benefit: 'Benefit one eligibility starts here', Icon: Crown },
  { level: 2, name: 'Bronze Level', members: '1,000 members', benefit: 'Mobile, fridge, AC, TV, or any electric item', Icon: Smartphone },
  { level: 3, name: 'Silver Level', members: '10,000 members', benefit: 'Bike benefit', Icon: Bike },
  { level: 4, name: 'Gold Level', members: '1,00,000 members', benefit: 'Car benefit', Icon: Car },
  { level: 5, name: 'Platinum Level', members: '10,00,000 members', benefit: 'House flat or ₹25 lakh benefit', Icon: House },
  { level: 6, name: 'Diamond Level', members: '100,00,000 members', benefit: 'Villa flat benefit', Icon: Gem }
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const isLoggedIn = Boolean(token);

  const packages = useApiData('/packages', demoPackages, (data) => data.packages || demoPackages);
  const tasks = useApiData(isLoggedIn ? '/tasks' : null, demoTasks, (data) => data.tasks || demoTasks);
  const wallet = useApiData(isLoggedIn ? '/wallet' : null, { wallet: { totalEarned: 0, availableBalance: 0, withdrawnAmount: 0 }, transactions: [] }, (data) => data);
  const withdrawals = useApiData(isLoggedIn ? '/withdrawals/my' : null, { withdrawals: [] }, (data) => data);
  const payments = useApiData(isLoggedIn ? '/payments/my' : null, { payments: [] }, (data) => data);
  const publicHome = useApiData('/public/home', { banners: [], packages: demoPackages, latestTasks: demoTasks }, (data) => data);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let cancelled = false;
    const refreshWallet = () => {
      api.get('/wallet', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
        .then((res) => {
          if (!cancelled) wallet.setData(res.data);
        })
        .catch(() => {});
      api.get('/tasks', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
        .then((res) => {
          if (!cancelled) tasks.setData(res.data.tasks || []);
        })
        .catch(() => {});
      api.get('/withdrawals/my', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
        .then((res) => {
          if (!cancelled) withdrawals.setData(res.data);
        })
        .catch(() => {});
      api.get('/payments/my', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
        .then((res) => {
          if (!cancelled) payments.setData(res.data);
        })
        .catch(() => {});
    };
    window.addEventListener('luminateads-wallet-refresh', refreshWallet);
    return () => {
      cancelled = true;
      window.removeEventListener('luminateads-wallet-refresh', refreshWallet);
    };
  }, [isLoggedIn, wallet.setData, tasks.setData, withdrawals.setData, payments.setData]);

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
    setNotificationCount(0);
    setActive('home');
  }

  async function refreshNotificationCount() {
    if (!isLoggedIn) return;
    try {
      const res = await api.get('/notifications', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } });
      setNotificationCount((res.data.notifications || []).filter((item) => !item.readAt).length);
    } catch {
      setNotificationCount(0);
    }
  }

  async function openNotifications() {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    try {
      const res = await api.get('/notifications', { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } });
      const rows = res.data.notifications || [];
      setNotifications(rows);
      const unread = rows.filter((item) => !item.readAt);
      if (unread.length) {
        await Promise.allSettled(unread.map((item) => api.put(`/notifications/${item.id}/read`)));
      }
      setNotificationCount(0);
      setNotificationsOpen(true);
    } catch (err) {
      setNotice(err.response?.data?.message || 'Unable to load notifications.');
    }
  }

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [active]);

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
        if (mounted && res.data.user) updateStoredUser({ ...res.data.user, subscription: res.data.subscription || res.data.user.subscription });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [token, active]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    refreshNotificationCount();
    const timer = window.setInterval(refreshNotificationCount, 60000);
    return () => window.clearInterval(timer);
  }, [isLoggedIn]);

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
          {isLoggedIn && (
            <button className="mobile-logout" onClick={() => { setMenuOpen(false); logout(); }}>
              <LogOut size={17} /> Logout
            </button>
          )}
        </nav>
        <div className="top-actions">
          {isLoggedIn ? (
            <>
              <button className="icon-btn notify-btn" title="Notifications" onClick={openNotifications}>
                <Bell size={18} />
                {notificationCount > 0 && <span className="alert-count">{notificationCount > 99 ? '99+' : notificationCount}</span>}
              </button>
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
        {active === 'tasks' && <TasksPage tasks={tasks.data} packages={packages.data} user={user} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setActive={setActive} />}
        {active === 'wallet' && <WalletPage wallet={wallet.data} withdrawals={withdrawals.data} payments={payments.data} isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
        {active === 'support' && <SupportPage isLoggedIn={isLoggedIn} setAuthOpen={setAuthOpen} setNotice={setNotice} />}
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img className="footer-logo" src={logo} alt="Luminate Ads" />
            <p>Smart ads, brighter results. A structured advertising and referral platform for daily ad tasks, hierarchy growth, and clear payout tracking.</p>
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
            <span>Payment updates</span>
            <span>Bank change permission</span>
            <span>Task completion tracking</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Luminate Ads. All rights reserved.</span>
          <div>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
        <div className="footer-download">
          <a href="/android/luminate.apk" download className="footer-download-btn">
            <Smartphone size={20} />
            Download Android version
          </a>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSession={saveSession} packages={packages.data} />}
      {paymentPackage && <PaymentModal pkg={paymentPackage} qrImageUrl={publicHome.data.banners?.find((item) => /payment|qr/i.test(`${item.title || ''} ${item.placement || ''}`))?.imageUrl} onClose={() => setPaymentPackage(null)} setNotice={setNotice} />}
      {notificationsOpen && <NotificationModal notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
    </div>
  );
}

function HomePage({ setActive, setAuthOpen, banners = [] }) {
  const cloudHero = banners.find((item) => ['home', 'dashboard'].includes(item.placement) && !/boom|offer|payment|qr/i.test(`${item.title || ''} ${item.imageUrl || ''}`))?.imageUrl;
  const heroBackground = cloudHero ? absoluteAssetUrl(cloudHero) : heroAdsPlatformImage;
  return (
    <>
      <section className="hero clean-hero" style={{ '--hero-background': `url("${heroBackground}")` }}>
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
            <p>{dailyAds(pkg)} advertisements · {money(perAdValue(pkg))} per advertisement · {money(dailyIncome(pkg))} estimated daily earnings.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Total advertisements {dailyAds(pkg)}</li>
              <li><CheckCircle2 size={16} /> Per advertisement earning {money(perAdValue(pkg))}</li>
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
          <h2>Complete your advertisements and follow every earning clearly.</h2>
        </div>
      </div>
      <div className="commission-table panel">
        <div className="commission-header">
          <span>Plan</span>
          <span>Total Ads</span>
          <span>Value / Ad</span>
        </div>
        {packages.map((pkg) => (
          <div className="commission-row" key={pkg.id}>
            <span>{pkg.name}</span>
            <strong>{dailyAds(pkg)}</strong>
            <strong>{money(perAdValue(pkg))}</strong>
          </div>
        ))}
        <div className="commission-total">
          <span>Each plan includes 20 advertisements after activation.</span>
          <strong>₹0.50 to ₹1.50 per ad</strong>
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
            'Free joiners can complete 10 free ads at ₹0.50 per ad.',
            'For free joiners, only the direct referrer receives 10% commission.',
            'Levels 2 to 10 do not receive commission from free ad activity.',
            'After package activation, the full paid referral structure applies up to Level 10.',
            'If someone joins without a referral, income is handled by the office account automatically.'
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
                <strong>Level {item.level} · {item.percent}%</strong>
                <small>{item.members} · {item.income}</small>
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
  const sortedDashboardTasks = sortTasksByPlan(tasks, packages);
  const dashboardTarget = dailyTargetForUserTasks(user, sortedDashboardTasks, packages);
  const progressSummary = getTaskProgressSummary(user?.id, sortedDashboardTasks, dashboardTarget);
  const watchedRows = progressSummary.rows.filter((row) => Number(row.progress.percent || 0) > 0);
  const gettingStarted = [
    ['Profile completed', Boolean(user?.name && user?.mobile)],
    ['Plan selected', Boolean(user?.packageId || user?.package)],
    ['Account activated', user?.status === 'active'],
    ['Bank details added', Boolean(user?.bankDetail?.upiId || user?.bankDetail?.accountNumber || user?.upiId)]
  ];
  const code = user?.referralCode || '';
  const link = referralLink(code);
  const subscription = user?.subscription || {};

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
          <h3>Plan Details</h3>
          <div className="transaction-row"><span>Plan Name</span><strong>{subscription.planName || user?.package?.name || 'No active plan'}</strong></div>
          <div className="transaction-row"><span>Plan Amount</span><strong>{money(subscription.planAmount || user?.package?.baseAmount)}</strong></div>
          <div className="transaction-row"><span>Start Date</span><strong>{subscription.planStartDate || '-'}</strong></div>
          <div className="transaction-row"><span>Expiry Date</span><strong>{subscription.planExpiryDate || '-'}</strong></div>
          <div className="transaction-row"><span>Status</span><strong>{subscription.status || user?.status || 'inactive'}</strong></div>
          <div className="transaction-row"><span>Remaining Ads</span><strong>{subscription.remainingAdvertisements ?? progressSummary.pending}</strong></div>
          <div className="transaction-row"><span>Total Ads</span><strong>{subscription.totalAdvertisements ?? progressSummary.total}</strong></div>
          <div className="transaction-row"><span>Completed Ads</span><strong>{subscription.advertisementsCompleted ?? progressSummary.completed}</strong></div>
          <div className="transaction-row"><span>Remaining Tasks</span><strong>{subscription.remainingTasks ?? progressSummary.pending}</strong></div>
        </article>
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
            <div><strong>{progressSummary.average}%</strong><span>Average progress</span></div>
          </div>
          <div className="progress-track"><span style={{ width: `${progressSummary.average}%` }} /></div>
          {progressSummary.total ? (
            <p className="muted">
              You completed {progressSummary.completed} of {progressSummary.total} daily tasks. {progressSummary.pending ? `Continue the remaining ${progressSummary.pending} task${progressSummary.pending === 1 ? '' : 's'} to close today’s activity.` : 'Today’s activity is complete.'}
            </p>
          ) : (
            <p className="muted">No active tasks are available for today yet.</p>
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
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    aadhaarNumber: user?.aadhaarNumber || user?.aadharNumber || '',
    panNumber: user?.bankDetail?.panNumber || user?.panNumber || ''
  });
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
      const res = await api.put('/auth/profile', {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile
      });
      if (profile.aadhaarNumber || profile.panNumber) {
        await api.put('/wallet/bank-details', {
          aadhaarNumber: profile.aadhaarNumber,
          panNumber: profile.panNumber
        });
      }
      const refreshed = await api.get('/auth/profile');
      if (refreshed.data.user) onUserUpdate({ ...refreshed.data.user, subscription: refreshed.data.subscription || refreshed.data.user.subscription });
      else if (res.data.user) onUserUpdate(res.data.user);
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
        <article className="panel profile-main-panel">
          <div className="profile-photo-column">
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
          </div>
          <div className="profile-info-column">
            <div className="profile-panel-head">
              <h3>Personal Information</h3>
              <p className="muted">Keep your contact and document details ready for account verification.</p>
            </div>
            <div className="profile-info-grid">
              <LabeledInput className="wide" label="Full Name" placeholder="Enter full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <LabeledInput label="Mobile Number" placeholder="Enter mobile number" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
              <LabeledInput className="wide" label="Email Address" placeholder="Enter email address" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <LabeledInput label="PAN Card" placeholder="Enter PAN number" value={profile.panNumber} onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })} />
              <LabeledInput className="wide" label="Aadhaar Card" placeholder="Enter Aadhaar number" value={profile.aadhaarNumber} onChange={(e) => setProfile({ ...profile, aadhaarNumber: e.target.value })} />
            </div>
            <button className="primary" onClick={saveProfile}>Save Profile</button>
          </div>
        </article>
        <article className="panel password-panel">
          <h3>{user?.hasPassword ? 'Change Password' : 'Add Password'}</h3>
          <p className="muted">Use a password to keep your account login simple and secure.</p>
          <div className="form-grid">
            {user?.hasPassword && <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />}
            <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <button className="ghost" onClick={savePassword}>{user?.hasPassword ? 'Change Password' : 'Add Password'}</button>
        </article>
      </div>
      <ProfileLevelPanel user={user} />
      <HierarchyPanel user={user} />
    </section>
  );
}

function LabeledInput({ label, className = '', ...props }) {
  return (
    <label className={`field-label ${className}`.trim()}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function ProfileLevelPanel({ user }) {
  const levelName = currentUserLevel(user);
  return (
    <article className="panel profile-level-panel">
      <div>
        <span className="section-kicker">Level Achievement</span>
        <h3>{levelName}</h3>
        <p className="muted">Your level grows as your downline and achievement milestones grow.</p>
      </div>
      <div className="level-table">
        <div className="level-table-head">
          <span>Level</span>
          <span>Achievement</span>
        </div>
        {achievementClubs.map((item) => (
          <div className="level-table-row" key={item.name}>
            <strong>{item.level}</strong>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </article>
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
              <span>Level {item.level} · {item.members}</span>
              <strong>{item.percent}% · {item.cumulative}</strong>
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

function TasksPage({ tasks, packages, user, isLoggedIn, setAuthOpen, setActive }) {
  const userPlanId = user?.packageId || user?.package?.id || '';
  const sortedPackages = sortPackagesByAmount(packages);
  const sortedTasks = sortTasksByPlan(tasks, sortedPackages);
  const isFreeJoiner = !userPlanId;
  const taskPlans = [freeTaskPlan, ...sortedPackages.slice(0, 3)];
  const firstPlanId = userPlanId || freeTaskPlan.id;
  const [selectedPlan, setSelectedPlan] = useState(firstPlanId);
  const [progressVersion, setProgressVersion] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [watchLockMessage, setWatchLockMessage] = useState('');
  useEffect(() => {
    if (firstPlanId && !taskPlans.some((pkg) => pkg.id === selectedPlan)) setSelectedPlan(firstPlanId);
  }, [firstPlanId, selectedPlan, taskPlans]);
  useEffect(() => {
    function refreshProgress() {
      setProgressVersion((value) => value + 1);
    }
    window.addEventListener('luminateads-task-progress', refreshProgress);
    return () => window.removeEventListener('luminateads-task-progress', refreshProgress);
  }, []);
  const dailyTarget = dailyTargetForUserTasks(user, sortedTasks, sortedPackages);
  const progressSummary = getTaskProgressSummary(user?.id, sortedTasks, dailyTarget);
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

  if (!isLoggedIn) return <Gate title="Daily ad activities" text="Login to see today’s assigned tasks and track your completion." action={setAuthOpen} />;
  const rowsByPlan = new Map();
  for (const row of progressSummary.rows) {
    const planId = taskPackageId(row.task) || firstPlanId;
    if (!rowsByPlan.has(planId)) rowsByPlan.set(planId, []);
    rowsByPlan.get(planId).push(row);
  }
  const effectivePlanId = selectedPlan || firstPlanId;
  const activePlan = taskPlans.find((pkg) => pkg.id === effectivePlanId) || taskPlans[0];
  const planLabels = ['Free 10 Ads', 'A Plan', 'B Plan', 'C Plan'];
  const freePlanAvailable = !user?.createdAt || new Date(user.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000 >= Date.now();
  const activePlanPurchased = activePlan?.id === freeTaskPlan.id ? freePlanAvailable : activePlan?.id === userPlanId;
  const effectiveRows = progressSummary.rows.filter((row) => {
    const planId = taskPackageId(row.task);
    return effectivePlanId === freeTaskPlan.id ? !planId : planId === effectivePlanId;
  });
  const activePlanTarget = activePlan ? dailyAds(activePlan) : effectiveRows.length;
  const activePlanCompleted = effectiveRows.filter((row) => Number(row.progress.percent || 0) >= 100).length;
  const activePlanPending = Math.max(activePlanTarget - activePlanCompleted, 0);
  const activePlanAverage = activePlanTarget ? Math.round(effectiveRows.reduce((sum, row) => sum + Number(row.progress.percent || 0), 0) / activePlanTarget) : 0;
  const calendar = getMonthlyCalendar(new Date(), activePlanTarget, activePlanCompleted);
  const nextTaskRow = effectiveRows.find((row) => Number(row.progress.percent || 0) < 100);
  const currentTask = nextTaskRow?.task || null;
  const currentTaskNumber = currentTask ? effectiveRows.findIndex((row) => row.task.id === currentTask.id) + 1 : activePlanTarget;

  return (
    <section className="section">
      <span className="section-kicker">Activities</span>
      <h2>Monthly calendar-based ad tasks.</h2>
      <div className="plan-switcher" aria-label="Task plan selector">
        {taskPlans.map((pkg, index) => (
          <button key={pkg.id} className={`${activePlan?.id === pkg.id ? 'active' : ''} ${(pkg.id === freeTaskPlan.id ? freePlanAvailable : pkg.id === userPlanId) ? 'purchased' : 'inactive-plan'}`} onClick={() => setSelectedPlan(pkg.id)}>
            <strong>{planLabels[index] || pkg.name}</strong>
            <span>{pkg.name}</span>
          </button>
        ))}
      </div>
      {activePlan && <p className="muted task-plan-note">{activePlan.name}</p>}
      {activePlan?.id === firstPlanId && (
        <p className="subscription-dates"><strong>Subscription:</strong> {user?.subscription?.planStartDate || '-'} to {user?.subscription?.planExpiryDate || '-'} · {user?.subscription?.status || 'free'}</p>
      )}
      {!activePlanPurchased && <div className="activate-plan-message">This plan is inactive. <button className="mini-link" onClick={() => setActive('packages')}>Purchase / Activate</button></div>}
      {activePlanPurchased && (
        <div className="daily-progress-panel">
          <div>
            <strong>{activePlanCompleted}/{activePlanTarget}</strong>
            <span>tasks completed today</span>
          </div>
          <div>
            <strong>{activePlanAverage}%</strong>
            <span>average task progress</span>
          </div>
          <p>{activePlanPending ? `${activePlanPending} task${activePlanPending === 1 ? '' : 's'} pending. Continue the remaining tasks to close today’s activity.` : 'All available tasks are completed for today.'}</p>
        </div>
      )}
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
                <span>{calendarStatusLabel(item.status)}</span>
                <small>{item.completedCount ? `${item.completedCount}/${item.count} ads` : `${item.count} ads`}</small>
              </button>
            )
          ))}
        </div>
      </div>
      <p className="muted task-policy">
        {isFreeJoiner
          ? `Complete all 10 free ads. Payout is available after 30 days from joining${user?.subscription?.freePayoutEligibleAt ? ` (${user.subscription.freePayoutEligibleAt})` : ''}; the direct referrer benefit follows the same payout timing.`
          : 'Complete the full daily ad count for your selected plan. Missed dates create an automatic daily debit as per the plan policy.'}
      </p>
      {activePlanPurchased && currentTask && (
        <div className="task-sequence-panel">
          <strong>Current task {currentTaskNumber} of {activePlanTarget}</strong>
          <span>Complete this task to continue.</span>
        </div>
      )}
      <div className="task-list">
        {!activePlanPurchased ? <p className="muted">Tasks will become available after this plan is purchased and approved.</p> : currentTask ? (
          <TaskCard
            task={currentTask}
            userId={user?.id}
            key={currentTask.id}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            setWatchLockMessage={setWatchLockMessage}
          />
        ) : sortedTasks.length ? (
          <p className="muted">All available tasks are completed for today. Your activity is ready for payout tracking.</p>
        ) : (
          <p className="muted">No active tasks are available right now. New ad tasks will appear here automatically.</p>
        )}
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
  const youtubeMaxWatchedRef = useRef(Number(storedProgress.seconds || 0));
  const directMaxWatchedRef = useRef(Number(storedProgress.seconds || 0));
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
      setWatchLockMessage?.('Please complete the current task first.');
      return false;
    }
    setActiveTaskId?.(task.id);
    setWatchLockMessage?.(`Task started: ${task.title}`);
    return true;
  }

  function completeWatch(seconds = 0) {
    setProgress(100);
    saveTaskProgress(userId, task.id, { percent: 100, seconds });
    setActiveTaskId?.('');
    setWatchLockMessage?.(`Completed: ${task.title}`);
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
      const maxWatched = Number(youtubeMaxWatchedRef.current || 0);
      if (currentTime > maxWatched + 2 && maxWatched > 0) {
        player.seekTo(maxWatched, true);
        return;
      }
      youtubeMaxWatchedRef.current = Math.max(maxWatched, currentTime);
      const safeSeconds = youtubeMaxWatchedRef.current;
      const watched = Math.min(100, Math.round((safeSeconds / duration) * 100));
      setProgress(watched);
      saveTaskProgress(userId, task.id, { percent: watched, seconds: safeSeconds });
      if (watched >= 100) clearInterval(progressTimer);
    }

    function createPlayer() {
      if (cancelled || !window.YT?.Player || !youtubeMountRef.current) return;
      youtubeMountRef.current.innerHTML = '';
      const playerElement = document.createElement('div');
      youtubeMountRef.current.appendChild(playerElement);
      youtubePlayerRef.current = new window.YT.Player(playerElement, {
        videoId: youtubeVideoId,
        playerVars: { controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (event) => {
            const saved = readTaskProgress(userId, task);
            if (!restoredYouTubeRef.current && Number(saved.seconds || 0) > 0) {
              restoredYouTubeRef.current = true;
              youtubeMaxWatchedRef.current = Number(saved.seconds);
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
    saveTaskProgress(userId, task.id, { percent: progress, seconds: readTaskProgress(userId, task).seconds || 0 });
    return undefined;
  }, [watching, isDirectVideo, canTrackYouTube, task.id, userId]);

  function onVideoProgress(event) {
    const video = event.currentTarget;
    if (!video.duration) return;
    const maxWatched = Number(directMaxWatchedRef.current || 0);
    if (video.currentTime > maxWatched + 2 && maxWatched > 0) {
      video.currentTime = maxWatched;
      return;
    }
    directMaxWatchedRef.current = Math.max(maxWatched, video.currentTime);
    const safeSeconds = directMaxWatchedRef.current;
    const watched = Math.min(100, Math.round((safeSeconds / video.duration) * 100));
    setProgress(watched);
    saveTaskProgress(userId, task.id, { percent: watched, seconds: safeSeconds });
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
      directMaxWatchedRef.current = Number(saved.seconds);
      event.currentTarget.currentTime = Number(saved.seconds);
      setProgress(Number(saved.percent || 0));
    }
    restoredDirectRef.current = true;
  }

  function openExternalTask(event) {
    event.stopPropagation();
    if (!videoUrl || !requestWatchStart()) return;
    setWatching(true);
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  }

  const platformLabel = getTaskPlatformLabel(task.platform, videoUrl);
  const platformIcon = getTaskPlatformIcon(task.platform, videoUrl);

  return (
    <article className="task-card">
            <span className="task-icon">{platformIcon}</span>
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>{platformLabel} · {progress >= 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Ready'}</small>
              <div className={`video-player ${isLocked ? 'locked' : ''}`} onClick={() => {
                if (!requestWatchStart()) return;
                setWatching(true);
                youtubePlayerRef.current?.playVideo?.();
              }}>
                {isLocked && <div className="video-lock-overlay">Complete the current task first</div>}
                {isDirectVideo ? (
                  <video ref={directVideoRef} src={videoUrl} controls={false} controlsList="nodownload noplaybackrate noremoteplayback" disablePictureInPicture onClick={(event) => {
                    if (event.currentTarget.paused) event.currentTarget.play();
                  }} onLoadedMetadata={restoreDirectVideo} onTimeUpdate={onVideoProgress} onSeeking={onVideoProgress} onPlay={onDirectVideoPlay} onEnded={(event) => {
                    completeWatch(event.currentTarget.duration || readTaskProgress(userId, task).seconds || 0);
                  }} />
                ) : embedUrl && canTrackYouTube ? (
                  <div className="youtube-frame" ref={youtubeMountRef} />
                ) : embedUrl ? (
                  <iframe src={embedUrl} title={task.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                ) : (
                  <div className="video-placeholder task-link-runner">
                    {platformIcon}
                    <strong>{platformLabel} Task</strong>
                    <span>{videoUrl ? 'Open the task link when needed, then return here to continue progress.' : 'No task link is attached to this activity yet.'}</span>
                    {videoUrl && <button type="button" className="primary" onClick={openExternalTask}>Open {platformLabel} Task</button>}
                  </div>
                )}
              </div>
              {embedUrl && !isDirectVideo && !canTrackYouTube && !isCompleted && (
                <div className="task-embed-actions">
                  <button type="button" className="ghost" onClick={openExternalTask}>Open outside</button>
                  <button type="button" className="primary" onClick={() => completeWatch(readTaskProgress(userId, task).seconds || 0)}>Mark Task Completed</button>
                </div>
              )}
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="progress-meta"><span>{progress}% completed</span><span>{progress >= 100 ? 'Completed' : 'Complete the task to move progress'}</span></div>
            </div>
    </article>
  );
}

function getTaskPlatformLabel(platform = '', url = '') {
  const value = `${platform} ${url}`.toLowerCase();
  if (value.includes('instagram')) return 'Instagram';
  if (value.includes('whatsapp') || value.includes('wa.me')) return 'WhatsApp';
  if (value.includes('youtube') || value.includes('youtu.be')) return 'YouTube';
  if (value.includes('facebook')) return 'Facebook';
  if (value.includes('telegram') || value.includes('t.me')) return 'Telegram';
  if (platform) return platform.charAt(0).toUpperCase() + platform.slice(1);
  return 'External';
}

function getTaskPlatformIcon(platform = '', url = '') {
  const label = getTaskPlatformLabel(platform, url);
  if (label === 'Instagram') return <Instagram />;
  if (label === 'WhatsApp') return <MessageCircle />;
  if (label === 'YouTube') return <PlayCircle />;
  if (label === 'External') return <Globe2 />;
  return <ClipboardCheck />;
}

function getEmbedUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = getYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = getYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('instagram.com')) {
      const cleanPath = parsed.pathname.replace(/\/$/, '');
      if (/\/(p|reel|tv)\//.test(cleanPath)) return `https://www.instagram.com${cleanPath}/embed`;
      return url;
    }
    if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')) {
      return url;
    }
    return url;
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

function withdrawalTone(statusColor, status) {
  if (statusColor === 'green' || status === 'paid') return 'green';
  if (statusColor === 'blue' || status === 'approved') return 'blue';
  if (statusColor === 'red' || status === 'processing' || status === 'rejected') return 'coral';
  return 'gold';
}

function WithdrawalStatus({ item }) {
  return <span className={`badge ${withdrawalTone(item.statusColor, item.status)}`}>{item.statusLabel || item.status || 'Initiated'}</span>;
}

function WalletPage({ wallet, withdrawals, payments, isLoggedIn, setAuthOpen, setNotice }) {
  const [bank, setBank] = useState({ bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSearch, setWithdrawSearch] = useState('');
  if (!isLoggedIn) return <Gate title="Your rewards stay organized." text="Login to see your balance, save bank or UPI details, and request money when you are ready." action={setAuthOpen} />;
  const withdrawalHistory = (withdrawals?.withdrawals || []).length
    ? withdrawals.withdrawals
    : (wallet.transactions || []).filter((tx) => tx.transactionType === 'withdrawal_request' || tx.category === 'withdrawal');
  const paymentHistory = payments?.payments || [];
  const filteredWithdrawals = withdrawalHistory.filter((tx) => `${tx.id || tx.transactionId || ''} ${tx.statusLabel || tx.status || ''} ${tx.transactionReferenceNumber || tx.transactionNumber || ''} ${tx.remarks || tx.adminRemarks || ''}`.toLowerCase().includes(withdrawSearch.toLowerCase()));
  const idTransactions = (wallet.transactions || []).filter((tx) => tx.transactionId || tx.id);

  async function saveBank() {
    try {
      await api.put('/wallet/bank-details', bank);
      setNotice('Bank details saved and locked for security.');
    } catch (err) {
      setNotice(err.response?.data?.message || 'Please contact support to change saved bank details.');
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
          <span>Withdraw Balance</span>
          <strong>{money(wallet.wallet?.availableBalance)}</strong>
          <small>Available rewards that can be requested for payout.</small>
          <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount to request" />
          <button className="primary" onClick={requestWithdrawal}>Request Money</button>
        </article>
        <article className="panel withdraw-history-panel">
          <h3>Withdraw History</h3>
          <input className="withdraw-search" value={withdrawSearch} onChange={(e) => setWithdrawSearch(e.target.value)} placeholder="Search ID, status, reference or remarks" />
          <div className="withdraw-history-scroll">
          {filteredWithdrawals.length ? filteredWithdrawals.map((tx) => (
            <div className="withdrawal-history-card" key={tx.id || tx.transactionId}>
              <div className="transaction-row">
                <span>ID</span>
                <strong>{tx.id || tx.transactionId}</strong>
              </div>
              <div className="transaction-row">
                <span>Request Date</span>
                <strong>{formatDate(tx.requestDate || tx.createdAt || tx.date)}</strong>
              </div>
              <div className="transaction-row">
                <span>Request Amount</span>
                <strong>{money(tx.amount)}</strong>
              </div>
              <div className="transaction-row">
                <span>Status</span>
                <strong><WithdrawalStatus item={tx} /></strong>
              </div>
              <div className="transaction-row">
                <span>Payment Date</span>
                <strong>{formatDate(tx.paymentDate || tx.paidAt) || '-'}</strong>
              </div>
              <div className="transaction-row">
                <span>Transaction Reference</span>
                <strong>{tx.transactionReferenceNumber || tx.transactionNumber || '-'}</strong>
              </div>
              <div className="transaction-row">
                <span>Remarks</span>
                <strong>{tx.remarks || tx.adminRemarks || '-'}</strong>
              </div>
              {(tx.timeline || tx.approvalHistory || []).length > 0 && (
                <div className="withdrawal-timeline">
                  {(tx.timeline || tx.approvalHistory || []).map((step, index) => (
                    <span className={`timeline-chip ${withdrawalTone(step.color, step.status)}`} key={`${step.status}-${step.updatedAt || index}`}>
                      {step.label || step.status} · {formatDate(step.updatedAt)} {step.updatedBy?.name ? `· ${step.updatedBy.name}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )) : <p className="muted">No matching withdrawal requests.</p>}
          </div>
        </article>
        <article className="panel">
          <h3>Bank Details</h3>
          <p className="muted">Bank details can be submitted once. For later changes, please contact support.</p>
          <div className="form-grid">
            <input placeholder="Bank name" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
            <input placeholder="Account holder name" value={bank.accountHolderName} onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })} />
            <input placeholder="Account number" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
            <input placeholder="IFSC code" value={bank.ifscCode} onChange={(e) => setBank({ ...bank, ifscCode: e.target.value })} />
          </div>
          <button className="ghost" onClick={saveBank}>Save Bank Details</button>
        </article>
        <article className="panel">
          <h3>UPI Details</h3>
          <p className="muted">Add a UPI ID if you prefer receiving payouts through UPI.</p>
          <div className="form-grid one">
            <input placeholder="UPI ID" value={bank.upiId} onChange={(e) => setBank({ ...bank, upiId: e.target.value })} />
          </div>
          <button className="ghost" onClick={saveBank}>Save UPI Details</button>
        </article>
      </div>
      <div className="panel recent-transactions-panel">
        <h3>Recent Transactions</h3>
        {idTransactions.length ? idTransactions.map((tx) => (
          <div className="withdrawal-history-card" key={tx.transactionId || tx.id}>
            <div className="transaction-row">
              <span>Transaction ID</span>
              <strong>{tx.transactionId || tx.id}</strong>
            </div>
            <div className="transaction-row">
              <span>Date / Time</span>
              <strong>{tx.date && tx.time ? `${tx.date} ${tx.time}` : formatDate(tx.createdAt)}</strong>
            </div>
            <div className="transaction-row">
              <span>Type</span>
              <strong>{tx.transactionType || tx.category || tx.type}</strong>
            </div>
            <div className="transaction-row">
              <span>Amount</span>
              <strong>{money(tx.amount)}</strong>
            </div>
            <div className="transaction-row">
              <span>Status</span>
              <strong>{tx.status || tx.type || '-'}</strong>
            </div>
            <div className="transaction-row">
              <span>Final Credited Amount</span>
              <strong>{tx.finalCreditedAmount === null || tx.finalCreditedAmount === undefined ? '-' : money(tx.finalCreditedAmount)}</strong>
            </div>
            <div className="transaction-row">
              <span>Remarks</span>
              <strong>{tx.remarks || '-'}</strong>
            </div>
          </div>
        )) : <p className="muted">No activity yet. Your rewards and requests will appear here.</p>}
      </div>
      <div className="panel recent-transactions-panel">
        <h3>Payment History</h3>
        {paymentHistory.length ? paymentHistory.map((payment) => (
          <div className="transaction-row" key={payment.id}>
            <span>{payment.package?.name || 'Subscription Payment'} · {formatDate(payment.createdAt)}</span>
            <strong>
              {money(payment.amount)} · {payment.status}
              {(payment.proofUrl || payment.screenshot) && (
                <a className="mini-link" href={payment.proofUrl || absoluteAssetUrl(payment.screenshot)} target="_blank" rel="noreferrer">View / Download</a>
              )}
            </strong>
          </div>
        )) : <p className="muted">Uploaded payment proofs will appear here after submission.</p>}
      </div>
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

function PaymentModal({ pkg, qrImageUrl, onClose, setNotice }) {
  const [utrNumber, setUtrNumber] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const baseAmount = packageBaseAmount(pkg);
  const taxAmount = packageTax(pkg);
  const finalAmount = packageFinalAmount(pkg);
  const qrSrc = qrImageUrl ? absoluteAssetUrl(qrImageUrl) : getPaymentQrSrc(finalAmount);

  async function submit(event) {
    event.preventDefault();
    if (!utrNumber.trim()) {
      setNotice('Please enter the UTR / transaction number after payment.');
      return;
    }
    if (!file) {
      setNotice('Please upload the payment proof or receipt.');
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('packageId', pkg.id);
      formData.append('paymentMode', 'upi');
      formData.append('utrNumber', utrNumber.trim());
      formData.append('screenshot', file);
      await api.post('/payments/upload-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotice('Your payment details have been submitted.');
      onClose();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Unable to submit payment details.');
    } finally {
      setBusy(false);
    }
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
          <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="UTR / transaction number" required />
          <label className="file-field">
            <Upload size={18} /> {file ? file.name : 'Upload payment proof or receipt'}
            <input type="file" accept="image/*,application/pdf" required onChange={(e) => setFile(e.target.files?.[0])} />
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

function NotificationModal({ notifications, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <span className="section-kicker">Notifications</span>
        <h2>Account Updates</h2>
        <div className="notification-list">
          {notifications.length ? notifications.map((item) => (
            <article className="notification-item" key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</small>
            </article>
          )) : <p className="muted">No notifications yet. Payment, activities, wallet, and support updates will appear here.</p>}
        </div>
      </div>
    </div>
  );
}

function TermsAndConditionsModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <img className="auth-simple-logo" src={logo} alt="Luminate Ads" />
        <h2>Terms and Conditions</h2>
        <div className="terms-content" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px 0' }}>
          <p>By registering with Luminate Ads, you confirm that you are at least 18 years old and that the information provided is true and accurate. You agree to our Terms and Conditions and consent to compliance with our policies, including eligibility, payment, and privacy rules. Registration is subject to verification and acceptance by Luminate Ads.</p>
          <p>You must also acknowledge that you understand the service terms, privacy policy, and any subscription or renewal requirements. Continued use of the app indicates acceptance of these terms.</p>
          <p>Please do not share your password with anyone and ensure your contact details are current. We may suspend accounts that violate our terms or provide false information.</p>
        </div>
        <button className="primary full" type="button" onClick={onClose}>Close and Accept</button>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onSession, packages }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(() => ({ name: '', email: '', mobile: '', dob: '', password: '', confirmPassword: '', identifier: '', referralCode: new URLSearchParams(window.location.search).get('ref') || '', packageId: packages[0]?.id || '', agreeTerms: false, agreeAge: false }));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  function calculateAge(dobString) {
    if (!dobString) return null;
    // support dd-mm-yyyy (mobile placeholder) and ISO yyyy-mm-dd
    let parsed;
    const dm = dobString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dm) {
      // convert dd-mm-yyyy to yyyy-mm-dd
      parsed = new Date(`${dm[3]}-${dm[2]}-${dm[1]}T00:00:00`);
    } else {
      parsed = new Date(dobString);
    }
    if (Number.isNaN(parsed.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - parsed.getFullYear();
    const monthDiff = now.getMonth() - parsed.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsed.getDate())) {
      age -= 1;
    }
    return age;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      const mobile = form.mobile.replace(/\D/g, '');
      const identifier = form.identifier.trim();
      const password = form.password;
      const referralCode = form.referralCode.trim();


      if (mode === 'register') {
        if (!name || !email || !mobile || !password || !form.dob) {
          setError('Please fill all required details.');
          setBusy(false);
          return;
        }
        const age = calculateAge(form.dob);
        if (age === null || age < 18) {
          setError('You must be at least 18 years old to register.');
          setBusy(false);
          return;
        }
        if (!form.agreeTerms) {
          setError('Please agree to the Terms and Conditions.');
          setBusy(false);
          return;
        }
        if (!form.agreeAge) {
          setError('Please confirm that you are 18 years or older.');
          setBusy(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setBusy(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError('Password and repeat password do not match.');
          setBusy(false);
          return;
        }
      } else if (!identifier || !password) {
        setError('Enter your email/mobile and password.');
        setBusy(false);
        return;
      }
      if (mode === 'login' && password.length < 6) {
        setError('Password must be at least 6 characters.');
        setBusy(false);
        return;
      }
      const payload = mode === 'login'
        ? { identifier, password }
        : { name, email, mobile, dob: form.dob, password, referralCode };
      const res = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      onSession(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response?.data?.message || 'This account is already registered. Please login instead.');
      } else if (err.response?.status === 422) {
        setError(err.response?.data?.message || 'Please check the entered details.');
      } else {
        setError(err.response?.data?.message || 'Unable to complete request. Please check details.');
      }
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setForm((current) => ({
      ...current,
      password: '',
      confirmPassword: '',
      identifier: nextMode === 'login' ? current.email || current.mobile || current.identifier : current.identifier
    }));
  }

  const isRegisterValid = mode === 'register'
    ? form.name && form.email && form.mobile && form.dob && form.password && form.confirmPassword && form.agreeTerms && form.agreeAge && form.password === form.confirmPassword && calculateAge(form.dob) >= 18
    : true;

  // Detect touch/mobile devices to show a placeholder-friendly date input
  const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  const dateInputType = isTouchDevice ? 'text' : 'date';

  return (
    <div className="modal-backdrop">
      <div className="auth-modal auth-simple-modal">
        <button className="icon-btn close" onClick={onClose} title="Close"><X size={18} /></button>
        <img className="auth-simple-logo" src={logo} alt="Luminate Ads" />
        <div className="auth-tabs">
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => switchMode('register')}>Register</button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => switchMode('login')}>Login</button>
        </div>
        <span className="section-kicker">{mode === 'login' ? 'Member Login' : 'Member Registration'}</span>
        <h2>{mode === 'login' ? 'Login to your dashboard' : 'Create your Luminate Ads account'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required placeholder="Mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <input required type="date" max={new Date().toISOString().split('T')[0]} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              <input placeholder="Referral code" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
            </>
          )}
          {mode === 'login' && (
            <input required placeholder="Email or mobile" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          )}
          <div className="password-field">
            <input required minLength={6} type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'register' && (
            <div className="password-field">
              <input required minLength={6} type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          {mode === 'register' && (
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" checked={form.agreeTerms} onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })} />
                <span>I agree to the <button type="button" className="checkbox-link" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Terms & Conditions</button></span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={form.agreeAge} onChange={(e) => setForm({ ...form, agreeAge: e.target.checked })} />
                <span>I confirm that I am 18 years or older.</span>
              </label>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          {showTermsModal && <TermsAndConditionsModal onClose={() => setShowTermsModal(false)} />}
          <button className="primary full" disabled={busy || (mode === 'register' && !isRegisterValid)}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
          {/* <button className="ghost full" type="button" onClick={() => { window.location.href = '/admin'; }}>Admin Login</button> */}
        </form>
      </div>
    </div>
  );
}

function RootApp() {
  return window.location.pathname.startsWith('/admin')
    ? <Suspense fallback={<div className="app-loading">Loading admin...</div>}><AdminApp /></Suspense>
    : <App />;
}

createRoot(document.getElementById('root')).render(<RootApp />);
