import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js?v=2';

if (/TEMPEL|GANTI/.test(SUPABASE_URL + SUPABASE_ANON_KEY)) {
  document.body.innerHTML =
    '<div style="padding:32px;font-family:sans-serif;max-width:480px;margin:auto"><h2>Satu langkah lagi</h2>' +
    '<p>Buka file <b>config.js</b>, isi alamat dan kunci Supabase Anda, simpan, lalu muat ulang halaman ini.</p></div>';
  throw new Error('config.js belum diisi');
}

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= Konstanta =================
const CAT_OUT = ['Belanja Bulanan', 'Listrik & Air', 'Transportasi', 'Makan', 'Pulsa & Internet', 'Kesehatan', 'Pendidikan', 'Hiburan', 'Cicilan', 'Lainnya'];
const CAT_IN = ['Gaji', 'Pemasukan Lain'];
const KIND = { bank: 'Bank', cash: 'Dompet Tunai', wallet: 'E-Wallet', savings: 'Tabungan' };
const KIND_IC = { bank: 'bank', cash: 'cash', wallet: 'wallet', savings: 'heart' };
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const PAGE = 10;

// kategori: [ikon, warna teks/ikon, warna latar]
const CAT = {
  'Belanja Bulanan': ['cart', '#2563eb', '#e3edff'],
  'Gaji': ['briefcase', '#16a34a', '#dcf5e4'],
  'Pemasukan Lain': ['cash', '#16a34a', '#dcf5e4'],
  'Transportasi': ['car', '#ea580c', '#ffe9dc'],
  'Makan': ['utensils', '#7c3aed', '#ece4ff'],
  'Listrik & Air': ['bolt', '#ca8a04', '#fdf1cc'],
  'Pulsa & Internet': ['phone', '#0891b2', '#d9f3f9'],
  'Kesehatan': ['heart', '#db2777', '#fde1ee'],
  'Pendidikan': ['book', '#4f46e5', '#e3e4ff'],
  'Hiburan': ['film', '#c026d3', '#f8e0fb'],
  'Cicilan': ['card', '#475569', '#e6ebf2'],
  'Lainnya': ['tag', '#475569', '#e6ebf2'],
  'Tarik tunai': ['cash', '#475569', '#e6ebf2'],
};
const catStyle = (c) => CAT[c] || CAT['Lainnya'];

const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['transaksi', 'Transaksi', 'sliders'],
  ['rekening', 'Rekening', 'wallet'],
  ['anggaran', 'Anggaran', 'pie'],
  ['laporan', 'Laporan', 'chart'],
  ['pengaturan', 'Pengaturan', 'gear'],
];
const TABS = [
  ['dashboard', 'Beranda', 'home'],
  ['transaksi', 'Transaksi', 'sliders'],
  ['laporan', 'Laporan', 'chart'],
  ['pengaturan', 'Pengaturan', 'gear'],
];

// ================= Ikon =================
const P = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>',
  bank: '<path d="M3 9l9-5 9 5"/><path d="M5 9v9M10 9v9M14 9v9M19 9v9"/><path d="M3 21h18"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
  pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  car: '<path d="M5 17h14M3 13l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  utensils: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10"/><path d="M17 3c-2 2-3 5-3 8h3v10"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><line x1="11" y1="18" x2="13" y2="18"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  film: '<rect x="2" y="7" width="20" height="13" rx="2"/><polyline points="17 2 12 7 7 2"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  dots: '<g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></g>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  arrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  chev: '<polyline points="6 9 12 15 18 9"/>',
  chevL: '<polyline points="15 18 9 12 15 6"/>',
  chevR: '<polyline points="9 18 15 12 9 6"/>',
};
const ic = (n, c = '') =>
  `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

// ================= State =================
const nowKey = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 7);
const loadHide = () => { try { return localStorage.getItem('hm_hide') === '1'; } catch { return false; } };

const S = {
  user: null, profile: null, family: null,
  accounts: [], txns: [], rules: [], members: [], budgets: [], budgetsOk: true,
  scope: 'family', view: 'dashboard', month: nowKey(), page: 1,
  sel: new Set(), pageOwnIds: [],
  f: { q: '', range: 'month', cat: '', acc: '', kind: '' },
  hide: loadHide(),
};

// ================= Helper =================
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = (n) => (Number(n) < 0 ? '- ' : '') + 'Rp ' + Math.abs(Math.round(Number(n) || 0)).toLocaleString('id-ID');
const money = (n) => (S.hide ? 'Rp ••••••' : rp(n));
const today = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const fmtDate = (d) => { const [y, m, dd] = d.split('-'); return `${Number(dd)} ${BULAN[m - 1]} ${y}`; };
const sumOf = (arr) => arr.reduce((s, t) => s + Number(t.amount), 0);
const show = (id, on) => $('#' + id).classList.toggle('hidden', !on);
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
const myId = () => S.user.id;
const famId = () => S.profile.family_id;
const memberName = (id) => S.members.find((m) => m.id === id)?.name || 'Pasangan';
const accName = (id) => S.accounts.find((a) => a.id === id)?.name || '—';
const isMine = (a) => a.owner_id === myId();
const isFamilyAcc = (a) => !a.owner_id;
const initial = (s) => (String(s || '?').trim()[0] || '?').toUpperCase();

function guess(text) {
  const t = (text || '').toLowerCase();
  const hit = S.rules.filter((r) => t.includes(r.keyword)).sort((a, b) => b.keyword.length - a.keyword.length)[0];
  return hit ? hit.category : 'Lainnya';
}
function catOptions(type, selected) {
  return (type === 'income' ? CAT_IN : CAT_OUT).map((c) => `<option ${c === selected ? 'selected' : ''}>${c}</option>`).join('');
}
function accountOptions(filter = () => true, selected) {
  return S.accounts.filter(filter).map((a) =>
    `<option value="${a.id}" ${a.id === selected ? 'selected' : ''}>${esc(a.name)} (${KIND[a.kind]})</option>`).join('');
}

function balances() {
  const b = {};
  S.accounts.forEach((a) => (b[a.id] = Number(a.opening_balance)));
  const add = (id, v) => { if (id && id in b) b[id] += v; };
  S.txns.forEach((t) => {
    const a = Number(t.amount);
    if (t.type === 'income') add(t.account_id, a);
    else if (t.type === 'expense') add(t.account_id, -a);
    else if (t.type === 'transfer' || t.type === 'withdrawal') { add(t.account_id, -a); add(t.to_account_id, a); }
  });
  return b;
}
const scoped = () => S.scope === 'mine'
  ? S.txns.filter((t) => t.owner_id === myId())
  : S.txns.filter((t) => t.visibility === 'shared');
const scopeAccounts = () => S.scope === 'mine'
  ? S.accounts.filter((a) => isMine(a) || isFamilyAcc(a))
  : S.accounts.filter(isFamilyAcc);

const isSpend = (t) => t.type === 'expense' || (t.type === 'withdrawal' && !t.to_account_id);
function monthStats(list, ym = S.month) {
  const m = list.filter((t) => t.txn_date.startsWith(ym) && t.status === 'ok');
  return { income: sumOf(m.filter((t) => t.type === 'income')), expense: sumOf(m.filter(isSpend)) };
}
function byCategory(list, ym = S.month) {
  const m = {};
  list.filter((t) => t.txn_date.startsWith(ym) && t.status === 'ok' && isSpend(t))
    .forEach((t) => { const c = t.category || 'Lainnya'; m[c] = (m[c] || 0) + Number(t.amount); });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function lastMonths(n) {
  const [y, m] = S.month.split('-').map(Number);
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.UTC(y, m - 1 - i, 1)).toISOString().slice(0, 7));
  return out;
}

// tampilan satu transaksi
function txView(t) {
  const pend = t.status === 'pending';
  const wallet = t.type === 'withdrawal' && !!t.to_account_id;
  const isIn = t.type === 'income';
  const cat = pend || wallet ? 'Tarik tunai' : (t.category || 'Lainnya');
  const title = pend ? 'Tarik tunai (belum dicatat)' : wallet ? 'Tarik tunai ke dompet' : (t.description || '(tanpa keterangan)');
  const cls = pend ? 'amber' : isIn ? 'green' : wallet ? 'blue' : 'red';
  const sign = pend || wallet ? '' : isIn ? '+ ' : '- ';
  return { pend, wallet, isIn, cat, title, cls, amount: sign + rp(t.amount) };
}
const labelChip = (t, v) => v.pend
  ? '<span class="chip pend">Perlu dicatat</span>'
  : t.visibility === 'shared' ? '<span class="chip fam">Keluarga</span>' : '<span class="chip pri">Pribadi</span>';
const catChip = (c) => {
  const [i, fg, bg] = catStyle(c);
  return `<span class="chip" style="background:${bg};color:${fg}">${ic(i)}${esc(c)}</span>`;
};

// ================= Login & data =================
async function route(session) {
  if (!session) { show('app', 0); show('onboard', 0); show('auth', 1); return; }
  S.user = session.user;
  const { data } = await sb.from('profiles').select('*').eq('id', S.user.id).maybeSingle();
  if (!data) { show('auth', 0); show('app', 0); show('onboard', 1); return; }
  S.profile = data;
  show('auth', 0); show('onboard', 0); show('app', 1);
  await refresh();
}

async function refresh() {
  const [a, t, r, m, f, b] = await Promise.all([
    sb.from('accounts').select('*').order('created_at'),
    sb.from('transactions').select('*').order('txn_date', { ascending: false }).order('created_at', { ascending: false }),
    sb.from('rules').select('*'),
    sb.from('profiles').select('id,name'),
    sb.from('families').select('*').eq('id', famId()).single(),
    sb.from('budgets').select('*'),
  ]);
  const err = [a, t, r, m, f].find((x) => x.error);
  if (err) return toast(err.error.message);
  S.budgetsOk = !b.error;
  Object.assign(S, { accounts: a.data, txns: t.data, rules: r.data, members: m.data, family: f.data, budgets: b.data || [] });
  S.sel.clear();
  render();
}

async function learnRule(desc, category) {
  const kw = desc.toLowerCase().trim();
  if (!kw || S.rules.some((r) => r.family_id && r.keyword === kw && r.category === category)) return;
  await sb.from('rules').insert({ family_id: famId(), keyword: kw, category });
}

// ================= Kerangka tampilan =================
function fillMonths() {
  const [y, m] = nowKey().split('-').map(Number);
  const keys = [];
  for (let i = 23; i >= -1; i--) keys.push(new Date(Date.UTC(y, m - 1 - i, 1)).toISOString().slice(0, 7));
  if (!keys.includes(S.month)) keys.push(S.month);
  keys.sort();
  $('#month').innerHTML = keys.map((k) => `<option value="${k}">${BULAN[+k.slice(5) - 1]} ${k.slice(0, 4)}</option>`).join('');
}

function scopeHtml() {
  return `
    <button class="scope-b ${S.scope === 'family' ? 'on' : ''}" data-scope="family">${ic('users')}<span><b>Keluarga</b><small>(Bersama)</small></span></button>
    <button class="scope-b ${S.scope === 'mine' ? 'on' : ''}" data-scope="mine">${ic('lock')}<span><b>Pribadi</b><small>(Hanya Saya)</small></span></button>`;
}

function render() {
  const pend = S.txns.filter((t) => t.status === 'pending' && t.owner_id === myId());

  $('#nav').innerHTML = NAV.map(([v, l, i]) =>
    `<button class="nav ${S.view === v ? 'active' : ''}" data-view="${v}">${ic(i)}<span>${l}</span></button>`).join('');
  $('#tabbar').innerHTML = TABS.map(([v, l, i]) =>
    `<button class="tab ${S.view === v ? 'active' : ''}" data-view="${v}">${ic(i)}<span>${l}</span></button>`).join('');
  $('#scope').innerHTML = scopeHtml();
  $('#m-scope').innerHTML = scopeHtml();

  const h = new Date().getHours();
  const sapa = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
  const names = S.scope === 'mine' ? [S.profile.name] : (S.members.length ? S.members.map((m) => m.name) : [S.profile.name]);
  $('#greet').textContent = `Selamat ${sapa}, ${names.join(' & ')}`;
  $('#greet-sub').textContent = S.scope === 'mine'
    ? 'Catatan pribadi, hanya terlihat oleh Anda'
    : 'Mari kelola keuangan keluarga dengan bijak 💙';
  $('#month').value = S.month;
  $('#btn-avatar').textContent = initial(S.profile.name);

  const badge = $('#badge');
  badge.classList.toggle('hidden', !pend.length);
  badge.textContent = pend.length;

  $('#banner').innerHTML = pend.length
    ? `<div class="banner"><span>Ada ${pend.length} tarik tunai menunggu dicatat. Untuk apa uangnya?</span><button class="pill" data-classify="${pend[0].id}">Catat sekarang</button></div>`
    : '';

  ({
    dashboard: renderDashboard, transaksi: renderTransaksi, rekening: renderRekening,
    anggaran: renderAnggaran, laporan: renderLaporan, pengaturan: renderPengaturan,
  })[S.view]();
}

const head = (title, icon, add = false) =>
  `<div class="page-head"><h1>${ic(icon)}<span>${title}</span></h1>${add ? `<button class="btn-primary" data-open-add>${ic('plus')}Tambah Transaksi</button>` : ''}</div>`;

function summary() {
  const list = scoped();
  const st = monthStats(list);
  const bal = balances();
  const total = scopeAccounts().reduce((s, a) => s + (bal[a.id] || 0), 0);
  const label = S.scope === 'mine' ? 'Saldo Total Saya' : 'Saldo Total Keluarga';
  return `<div class="sum">
    <div class="sum-d">
      <div class="card sc"><span class="circ in-c">${ic('arrowDown')}</span><div><small>Total Pemasukan</small><b>${rp(st.income)}</b></div></div>
      <div class="card sc"><span class="circ out-c">${ic('arrowUp')}</span><div><small>Total Pengeluaran</small><b>${rp(st.expense)}</b></div></div>
      <div class="card sc hero-c"><span class="circ white-c">${ic('home')}</span><div><small>${label}</small><b class="blue">${money(total)}</b></div></div>
    </div>
    <div class="sum-m">
      <div class="hero">
        <small>${label}<button class="eye" data-eye aria-label="Tampilkan atau sembunyikan saldo">${ic(S.hide ? 'eyeOff' : 'eye')}</button></small>
        <b>${money(total)}</b>
        <span class="hero-ic">${ic('home')}</span>
      </div>
      <div class="mini">
        <div class="card mc"><span class="circ-s in-c">${ic('arrowDown')}</span><small>Total Pemasukan</small><b>${rp(st.income)}</b></div>
        <div class="card mc"><span class="circ-s out-c">${ic('arrowUp')}</span><small>Total Pengeluaran</small><b>${rp(st.expense)}</b></div>
      </div>
    </div>
  </div>`;
}

function miItem(t) {
  const v = txView(t);
  const [i, fg, bg] = catStyle(v.cat);
  const other = t.owner_id !== myId() ? ` · oleh ${esc(memberName(t.owner_id))}` : '';
  return `<div class="mi">
    <span class="mi-ic" style="background:${bg};color:${fg}">${ic(i)}</span>
    <div class="mi-b"><small>${fmtDate(t.txn_date)}${other}</small><b>${esc(v.title)}</b></div>
    <div class="mi-r"><span class="amt ${v.cls}">${v.amount}</span>${labelChip(t, v)}</div>
    ${v.pend ? `<button class="pill" data-classify="${t.id}">Catat</button>`
      : t.owner_id === myId() ? `<button class="dots" data-edit="${t.id}" aria-label="Aksi">${ic('dots')}</button>` : ''}
  </div>`;
}

function accRow(a, bal) {
  return `<div class="acc-row">
    <span class="mi-ic" style="background:#e4eeff;color:#2563eb">${ic(KIND_IC[a.kind])}</span>
    <div><b>${esc(a.name)}</b><small>${KIND[a.kind]} · ${a.owner_id ? esc(memberName(a.owner_id)) : 'Keluarga'}</small></div>
    <span class="bal">${money(bal[a.id] || 0)}</span>
  </div>`;
}

function catBars(list, limit = 99) {
  const all = byCategory(list);
  const total = all.reduce((s, [, v]) => s + v, 0);
  if (!all.length) return '<p class="muted">Belum ada pengeluaran bulan ini.</p>';
  return all.slice(0, limit).map(([c, v]) => {
    const [i, fg, bg] = catStyle(c);
    const pct = total ? Math.round((v / total) * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-top"><span class="mi-ic" style="background:${bg};color:${fg}">${ic(i)}</span><span class="nm">${esc(c)}</span><b>${rp(v)}</b><small>${pct}%</small></div>
      <div class="bar"><i style="width:${Math.max(pct, 2)}%;background:${fg}"></i></div>
    </div>`;
  }).join('');
}

// ================= Dashboard =================
function renderDashboard() {
  const list = scoped();
  const recent = list.filter((t) => t.status === 'ok').slice(0, 6);
  const bal = balances();
  const accs = scopeAccounts();
  $('#page').innerHTML = `<div class="page">
    ${head('Dashboard', 'home', true)}
    ${summary()}
    <div class="two">
      <div class="card pad">
        <div class="card-h"><h3>Rekening &amp; Tabungan</h3><button class="link" data-view="rekening">Kelola</button></div>
        ${accs.length ? accs.map((a) => accRow(a, bal)).join('')
          : '<p class="muted">Belum ada rekening untuk tampilan ini. Tambahkan di menu Rekening.</p>'}
      </div>
      <div class="card pad">
        <div class="card-h"><h3>Pengeluaran bulan ini</h3><button class="link" data-view="laporan">Detail</button></div>
        ${catBars(list, 5)}
      </div>
    </div>
    <div class="card pad">
      <div class="card-h"><h3>Transaksi terbaru</h3><button class="link" data-view="transaksi">Lihat semua</button></div>
      ${recent.length ? `<div class="mlist">${recent.map(miItem).join('')}</div>` : '<p class="muted">Belum ada transaksi. Tekan Tambah Transaksi untuk mulai.</p>'}
    </div>
  </div>`;
}

// ================= Transaksi =================
const RANGE = [['month', 'Tanggal'], ['7', '7 hari terakhir'], ['30', '30 hari terakhir'], ['all', 'Semua waktu']];
const KINDF = [['', 'Filter'], ['income', 'Pemasukan'], ['expense', 'Pengeluaran'], ['withdraw', 'Tarik tunai'], ['pending', 'Belum dicatat']];

const opts = (arr, sel) => arr.map(([v, l]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');

function renderTransaksi() {
  const f = S.f;
  const cats = [['', 'Kategori'], ...[...CAT_OUT, ...CAT_IN, 'Tarik tunai'].map((c) => [c, c])];
  const accs = [['', 'Rekening'], ...S.accounts.filter((a) => isMine(a) || isFamilyAcc(a)).map((a) => [a.id, a.name])];
  $('#page').innerHTML = `<div class="page">
    ${head('Transaksi', 'sliders', true)}
    ${summary()}
    <div class="filters">
      <label class="search">${ic('search')}<input id="f-q" placeholder="Cari transaksi..." value="${esc(f.q)}" autocomplete="off"></label>
      <div class="pills">
        <label class="pill-select">${ic('calendar')}<select id="f-range">${opts(RANGE, f.range)}</select>${ic('chev')}</label>
        <label class="pill-select">${ic('grid')}<select id="f-cat">${opts(cats, f.cat)}</select>${ic('chev')}</label>
        <label class="pill-select">${ic('card')}<select id="f-acc">${opts(accs, f.acc)}</select>${ic('chev')}</label>
        <label class="pill-select">${ic('sliders')}<select id="f-kind">${opts(KINDF, f.kind)}</select>${ic('chev')}</label>
      </div>
    </div>
    <div class="card tbl-wrap" id="txn-area"></div>
  </div>`;
  updateTxnArea();
}

function filteredTxns() {
  const f = S.f;
  let list = scoped();
  if (f.range === 'month') list = list.filter((t) => t.txn_date.startsWith(S.month));
  else if (f.range === '7' || f.range === '30') {
    const d = new Date(Date.now() + 8 * 3600e3 - Number(f.range) * 86400e3).toISOString().slice(0, 10);
    list = list.filter((t) => t.txn_date >= d);
  }
  const q = f.q.trim().toLowerCase();
  if (q) list = list.filter((t) => `${t.description || ''} ${txView(t).cat} ${accName(t.account_id)}`.toLowerCase().includes(q));
  if (f.cat) list = list.filter((t) => txView(t).cat === f.cat);
  if (f.acc) list = list.filter((t) => t.account_id === f.acc || t.to_account_id === f.acc);
  if (f.kind === 'income') list = list.filter((t) => t.type === 'income');
  else if (f.kind === 'expense') list = list.filter(isSpend);
  else if (f.kind === 'withdraw') list = list.filter((t) => t.type === 'withdrawal');
  else if (f.kind === 'pending') list = list.filter((t) => t.status === 'pending');
  return list;
}

function pagerHtml(total, pages, start) {
  const from = total ? start + 1 : 0;
  const to = Math.min(total, start + PAGE);
  let b = Math.min(pages, Math.max(1, S.page - 2) + 4);
  const a = Math.max(1, b - 4);
  const nums = [];
  for (let i = a; i <= b; i++) nums.push(i);
  return `<div class="pager">
    <span>Menampilkan ${from}–${to} dari ${total} transaksi</span>
    <div class="pg">
      <button class="pgb" data-page="${S.page - 1}" ${S.page <= 1 ? 'disabled' : ''} aria-label="Sebelumnya">${ic('chevL')}</button>
      ${nums.map((n) => `<button class="pgb ${n === S.page ? 'on' : ''}" data-page="${n}">${n}</button>`).join('')}
      <button class="pgb" data-page="${S.page + 1}" ${S.page >= pages ? 'disabled' : ''} aria-label="Berikutnya">${ic('chevR')}</button>
    </div>
  </div>`;
}

function updateTxnArea() {
  const el = $('#txn-area'); if (!el) return;
  const all = filteredTxns();
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  S.page = Math.min(Math.max(1, S.page), pages);
  const start = (S.page - 1) * PAGE;
  const rows = all.slice(start, start + PAGE);
  S.pageOwnIds = rows.filter((t) => t.owner_id === myId()).map((t) => t.id);
  const allSel = S.pageOwnIds.length > 0 && S.pageOwnIds.every((id) => S.sel.has(id));

  if (!rows.length) {
    el.innerHTML = '<div class="empty">Belum ada transaksi yang cocok.</div>' + pagerHtml(0, 1, 0);
    return;
  }

  const bulk = S.sel.size
    ? `<div class="bulk"><span>${S.sel.size} dipilih</span><button class="btn-danger" data-bulkdel>Hapus</button><button class="link" data-clearsel>Batal</button></div>`
    : '';

  const tr = rows.map((t) => {
    const v = txView(t);
    const mine = t.owner_id === myId();
    const other = !mine ? `<small>oleh ${esc(memberName(t.owner_id))}</small>` : '';
    const acc = S.accounts.find((a) => a.id === t.account_id);
    return `<tr>
      <td>${mine ? `<input class="cb" type="checkbox" data-sel="${t.id}" ${S.sel.has(t.id) ? 'checked' : ''}>` : ''}</td>
      <td>${fmtDate(t.txn_date)}</td>
      <td class="ttl"><b>${esc(v.title)}</b>${other}</td>
      <td>${catChip(v.cat)}</td>
      <td><span class="acc-c">${ic(acc ? KIND_IC[acc.kind] : 'bank')}${esc(accName(t.account_id))}</span></td>
      <td class="r"><span class="amt ${v.cls}">${v.amount}</span></td>
      <td>${labelChip(t, v)}</td>
      <td class="act">${v.pend ? `<button class="pill" data-classify="${t.id}">Catat</button>`
        : mine ? `<button class="dots" data-edit="${t.id}" aria-label="Aksi">${ic('dots')}</button>` : ''}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `${bulk}
    <div class="only-d"><table class="tbl-d">
      <thead><tr>
        <th><input class="cb" type="checkbox" data-selall ${allSel ? 'checked' : ''} ${S.pageOwnIds.length ? '' : 'disabled'}></th>
        <th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th>Rekening</th><th class="r">Jumlah</th><th>Label</th><th>Aksi</th>
      </tr></thead>
      <tbody>${tr}</tbody>
    </table></div>
    <div class="only-m"><div class="mlist">${rows.map(miItem).join('')}</div></div>
    ${pagerHtml(all.length, pages, start)}`;
}

// ================= Rekening =================
function renderRekening() {
  const bal = balances();
  $('#page').innerHTML = `<div class="page">
    ${head('Rekening', 'wallet')}
    <form id="form-account" class="card pad stack">
      <h3>Tambah rekening / dompet</h3>
      <div class="form-grid">
        <input class="inp" name="name" placeholder="Nama, misal: BCA Utama" required>
        <select class="inp" name="kind">
          <option value="bank">Bank</option>
          <option value="cash">Dompet Tunai</option>
          <option value="wallet">E-Wallet</option>
          <option value="savings">Tabungan</option>
        </select>
        <input class="inp" name="opening" type="number" inputmode="numeric" placeholder="Saldo awal (Rp)" value="0">
        <select class="inp" name="owner"><option value="me">Milik saya (pribadi)</option><option value="family">Milik keluarga (bersama)</option></select>
      </div>
      <div class="row-btn">
        <span class="muted small">Rekening keluarga masuk ke saldo keluarga. Dompet Tunai dipakai untuk uang tarik tunai yang belum dibelanjakan.</span>
        <button class="btn-primary">Tambah</button>
      </div>
    </form>
    <div class="acc-grid">${S.accounts.map((a) => `
      <div class="card acc-card">
        <div class="top2"><span class="mi-ic" style="background:#e4eeff;color:#2563eb">${ic(KIND_IC[a.kind])}</span>
          <div><b>${esc(a.name)}</b><br><small class="muted">${KIND[a.kind]} · ${a.owner_id ? esc(memberName(a.owner_id)) : 'Keluarga'}</small></div></div>
        <b class="big">${money(bal[a.id] || 0)}</b>
      </div>`).join('') || '<p class="muted">Belum ada rekening.</p>'}
    </div>
  </div>`;
}

// ================= Anggaran =================
function renderAnggaran() {
  let body;
  if (!S.budgetsOk) {
    body = `<div class="notice"><b>Menu Anggaran perlu satu langkah tambahan (hanya sekali).</b><br>
      Buka Supabase &gt; SQL Editor, tempel isi file <b>update-anggaran.sql</b>, lalu klik Run. Setelah itu muat ulang halaman ini.</div>`;
  } else {
    const spentList = S.txns.filter((t) => t.visibility === 'shared');
    const spent = Object.fromEntries(byCategory(spentList));
    const totB = S.budgets.reduce((s, b) => s + Number(b.amount), 0);
    const totS = S.budgets.reduce((s, b) => s + (spent[b.category] || 0), 0);
    const rows = [...S.budgets].sort((a, b) => a.category.localeCompare(b.category)).map((b) => {
      const sp = spent[b.category] || 0;
      const pct = Math.round((sp / Number(b.amount)) * 100);
      const col = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#16a34a';
      const [i, fg, bg] = catStyle(b.category);
      const left = Number(b.amount) - sp;
      return `<div class="card pad">
        <div class="bar-top"><span class="mi-ic" style="background:${bg};color:${fg}">${ic(i)}</span>
          <span class="nm">${esc(b.category)}</span>
          <button class="dots" data-delbudget="${b.id}" aria-label="Hapus anggaran">✕</button></div>
        <div class="row-btn"><span>${rp(sp)} <span class="muted">dari ${rp(b.amount)}</span></span><b style="color:${col}">${pct}%</b></div>
        <div class="bar prog-wrap"><i style="width:${Math.min(pct, 100)}%;background:${col}"></i></div>
        <small class="muted">${left >= 0 ? `Sisa ${rp(left)}` : `Lebih ${rp(-left)}`}</small>
      </div>`;
    }).join('');
    body = `
      <form id="form-budget" class="card pad stack">
        <h3>Atur anggaran bulanan</h3>
        <div class="form-grid">
          <select class="inp" name="category">${catOptions('expense', 'Belanja Bulanan')}</select>
          <input class="inp" name="amount" type="number" inputmode="numeric" placeholder="Batas per bulan (Rp)" required min="1">
        </div>
        <div class="row-btn"><span class="muted small">Dihitung dari transaksi yang dibagikan ke keluarga pada bulan terpilih.</span><button class="btn-primary">Simpan</button></div>
      </form>
      ${S.budgets.length ? `<div class="card pad"><div class="row-btn"><span class="muted">Total terpakai bulan ini</span><b>${rp(totS)} <span class="muted">dari ${rp(totB)}</span></b></div></div>` : ''}
      ${rows || '<div class="card pad"><p class="muted" style="margin:0">Belum ada anggaran. Pilih kategori dan isi batas di atas.</p></div>'}`;
  }
  $('#page').innerHTML = `<div class="page">${head('Anggaran', 'pie')}${body}</div>`;
}

// ================= Laporan =================
function renderLaporan() {
  const list = scoped();
  const st = monthStats(list);
  const net = st.income - st.expense;
  const months = lastMonths(6);
  const stats = months.map((ym) => [ym, monthStats(list, ym)]);
  const max = Math.max(1, ...stats.flatMap(([, s]) => [s.income, s.expense]));
  const pct = (v) => Math.round((v / max) * 100);
  $('#page').innerHTML = `<div class="page">
    ${head('Laporan', 'chart')}
    <div class="sum"><div class="sum-d">
      <div class="card sc"><span class="circ in-c">${ic('arrowDown')}</span><div><small>Pemasukan</small><b>${rp(st.income)}</b></div></div>
      <div class="card sc"><span class="circ out-c">${ic('arrowUp')}</span><div><small>Pengeluaran</small><b>${rp(st.expense)}</b></div></div>
      <div class="card sc hero-c"><span class="circ white-c">${ic('pie')}</span><div><small>Selisih bulan ini</small><b class="${net >= 0 ? 'green' : 'red'}">${rp(net)}</b></div></div>
    </div>
    <div class="sum-m"><div class="mini" style="margin-top:0">
      <div class="card mc"><span class="circ-s in-c">${ic('arrowDown')}</span><small>Pemasukan</small><b>${rp(st.income)}</b></div>
      <div class="card mc"><span class="circ-s out-c">${ic('arrowUp')}</span><small>Pengeluaran</small><b>${rp(st.expense)}</b></div>
    </div><div class="card pad" style="margin-top:12px"><div class="row-btn"><span class="muted">Selisih bulan ini</span><b class="${net >= 0 ? 'green' : 'red'}">${rp(net)}</b></div></div></div></div>
    <div class="two">
      <div class="card pad"><div class="card-h"><h3>Pengeluaran per kategori</h3></div>${catBars(list)}</div>
      <div class="card pad"><div class="card-h"><h3>6 bulan terakhir</h3></div>
        <div class="trend">${stats.map(([ym, s]) => `
          <div class="tcol"><div class="tbars">
            <i class="b-in" style="height:${pct(s.income)}%" title="Pemasukan ${rp(s.income)}"></i>
            <i class="b-out" style="height:${pct(s.expense)}%" title="Pengeluaran ${rp(s.expense)}"></i>
          </div><small>${BULAN[+ym.slice(5) - 1]}</small></div>`).join('')}</div>
        <div class="legend"><span><i style="background:#3b82f6"></i>Pemasukan</span><span><i style="background:#ef4444"></i>Pengeluaran</span></div>
      </div>
    </div>
  </div>`;
}

// ================= Pengaturan =================
function renderPengaturan() {
  $('#page').innerHTML = `<div class="page">
    ${head('Pengaturan', 'gear')}
    <div class="card pad stack">
      <h3>Keluarga</h3>
      <div>Nama keluarga: <b>${esc(S.family?.name)}</b></div>
      <div class="row-btn">
        <span>Kode undangan untuk pasangan: <span class="code">${esc(S.family?.invite_code)}</span></span>
        <button class="btn-ghost" data-copy="${esc(S.family?.invite_code)}">Salin kode</button>
      </div>
    </div>
    <div class="card pad">
      <div class="card-h"><h3>Anggota</h3></div>
      ${S.members.map((m) => `<div class="acc-row"><span class="avatar sm">${esc(initial(m.name))}</span>
        <div><b>${esc(m.name)}</b><small>${m.id === myId() ? 'Anda' : 'Pasangan'}</small></div></div>`).join('')}
    </div>
    <div class="card pad stack">
      <h3>Akun</h3>
      <div class="muted">Masuk sebagai ${esc(S.user.email)}</div>
      <div><button class="btn-ghost" id="btn-logout">Keluar</button></div>
    </div>
  </div>`;
}

// ================= Aksi =================
function openAdd() {
  const f = $('#form-add');
  f.reset();
  delete f.category.dataset.manual;
  f.dataset.type = 'expense';
  document.querySelectorAll('[data-addtype]').forEach((b) => b.classList.toggle('on', b.dataset.addtype === 'expense'));
  f.category.innerHTML = catOptions('expense', 'Lainnya');
  f.account.innerHTML = accountOptions((a) => isMine(a) || isFamilyAcc(a))
    || '<option value="">(belum ada rekening)</option>';
  $('#dlg-add').showModal();
  setTimeout(() => f.amount.focus(), 50);
}

function setAddType(type) {
  if (type === 'withdrawal') { $('#dlg-add').close(); return openWithdraw(); }
  const f = $('#form-add');
  f.dataset.type = type;
  document.querySelectorAll('[data-addtype]').forEach((b) => b.classList.toggle('on', b.dataset.addtype === type));
  delete f.category.dataset.manual;
  f.category.innerHTML = catOptions(type, guess(f.desc.value));
}

async function saveTxn(f) {
  const account = S.accounts.find((a) => a.id === f.account.value);
  if (!account) return toast('Tambahkan rekening dulu di menu Rekening');
  const type = f.dataset.type || 'expense';
  const desc = f.desc.value.trim();
  const category = f.category.value;
  if (f.category.dataset.manual) await learnRule(desc, category);

  const { error } = await sb.from('transactions').insert({
    family_id: famId(), owner_id: myId(), account_id: account.id,
    type, amount: Number(f.amount.value),
    description: desc, category,
    visibility: isFamilyAcc(account) || f.shared.checked ? 'shared' : 'private',
    status: 'ok', txn_date: today(), source: 'manual',
  });
  if (error) return toast(error.message);
  $('#dlg-add').close();
  toast('Tersimpan');
  await refresh();
}

function openWithdraw(pendingId) {
  const f = $('#form-withdraw');
  const pending = pendingId ? S.txns.find((t) => t.id === pendingId) : null;
  f.reset();
  f.pendingId.value = pending?.id || '';
  f.amount.value = pending ? pending.amount : '';
  f.account.innerHTML = accountOptions((a) => a.kind !== 'cash' && (isMine(a) || isFamilyAcc(a)), pending?.account_id);
  const cash = S.accounts.filter((a) => a.kind === 'cash' && (isMine(a) || isFamilyAcc(a)));
  f.cash.innerHTML = cash.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join('')
    || '<option value="">(belum ada Dompet Tunai)</option>';
  f.category.innerHTML = catOptions('expense', 'Lainnya');
  $('#wd-spend').classList.add('hidden');
  $('#dlg-withdraw').showModal();
}

async function saveWithdraw(f) {
  const mode = f.querySelector('[name=mode]:checked').value;
  const cashId = f.cash.value || null;
  const desc = f.desc.value.trim();
  if (mode === 'wallet' && !cashId) return toast('Buat rekening Dompet Tunai dulu di menu Rekening');

  const account = S.accounts.find((a) => a.id === f.account.value);
  if (!account) return toast('Pilih rekening asal dulu');
  const fields = mode === 'wallet'
    ? { to_account_id: cashId, category: null, description: 'Tarik tunai (dompet)' }
    : { to_account_id: null, category: f.category.value, description: desc || 'Tarik tunai' };
  if (mode === 'spend' && desc) await learnRule(desc, f.category.value);

  const payload = { ...fields, type: 'withdrawal', account_id: account.id, amount: Number(f.amount.value), status: 'ok' };
  const { error } = f.pendingId.value
    ? await sb.from('transactions').update(payload).eq('id', f.pendingId.value)
    : await sb.from('transactions').insert({
        ...payload, family_id: famId(), owner_id: myId(), source: 'manual',
        txn_date: today(), visibility: isFamilyAcc(account) ? 'shared' : 'private',
      });
  if (error) return toast(error.message);
  $('#dlg-withdraw').close();
  toast('Tarik tunai dicatat');
  await refresh();
}

function openEdit(id) {
  const t = S.txns.find((x) => x.id === id);
  if (!t || t.owner_id !== myId()) return;
  const f = $('#form-edit');
  const v = txView(t);
  f.txnId.value = t.id;
  f.desc.value = t.description || '';
  $('#edit-cat-wrap').classList.toggle('hidden', v.wallet);
  f.category.innerHTML = catOptions(t.type === 'income' ? 'income' : 'expense', t.category || 'Lainnya');
  const acc = S.accounts.find((a) => a.id === t.account_id);
  f.visibility.value = t.visibility;
  f.visibility.disabled = !!(acc && isFamilyAcc(acc));
  $('#edit-info').textContent = `${fmtDate(t.txn_date)} · ${rp(t.amount)} · ${accName(t.account_id)}`;
  $('#dlg-edit').showModal();
}

async function saveEdit(f) {
  const t = S.txns.find((x) => x.id === f.txnId.value);
  if (!t) return;
  const v = txView(t);
  const desc = f.desc.value.trim() || t.description;
  const upd = { description: desc, visibility: f.visibility.disabled ? 'shared' : f.visibility.value };
  if (!v.wallet) {
    upd.category = f.category.value;
    if (upd.category !== t.category) await learnRule(desc, upd.category);
  }
  const { error } = await sb.from('transactions').update(upd).eq('id', t.id);
  if (error) return toast(error.message);
  $('#dlg-edit').close();
  toast('Tersimpan');
  await refresh();
}

async function saveAccount(f) {
  const fd = new FormData(f);
  const { error } = await sb.from('accounts').insert({
    family_id: famId(),
    owner_id: fd.get('owner') === 'me' ? myId() : null,
    name: String(fd.get('name')).trim(),
    kind: fd.get('kind'),
    opening_balance: Number(fd.get('opening')) || 0,
  });
  if (error) return toast(error.message);
  toast('Rekening ditambahkan');
  await refresh();
}

async function saveBudget(f) {
  const { error } = await sb.from('budgets').upsert(
    { family_id: famId(), category: f.category.value, amount: Number(f.amount.value) },
    { onConflict: 'family_id,category' });
  if (error) return toast(error.message);
  toast('Anggaran disimpan');
  await refresh();
}

async function deleteTxns(ids) {
  const { error } = await sb.from('transactions').delete().in('id', ids);
  if (error) return toast(error.message);
  toast('Dihapus');
  await refresh();
}

// ================= Event =================
document.addEventListener('click', async (e) => {
  const t = e.target;
  const v = t.closest('[data-view]');
  if (v) { S.view = v.dataset.view; S.page = 1; render(); return window.scrollTo(0, 0); }
  const sc = t.closest('[data-scope]');
  if (sc) { S.scope = sc.dataset.scope; S.page = 1; S.sel.clear(); return render(); }
  const cl = t.closest('[data-classify]');
  if (cl) return openWithdraw(cl.dataset.classify);
  const ed = t.closest('[data-edit]');
  if (ed) return openEdit(ed.dataset.edit);
  if (t.closest('[data-open-add]')) return openAdd();
  const at = t.closest('[data-addtype]');
  if (at) return setAddType(at.dataset.addtype);
  const pg = t.closest('[data-page]');
  if (pg) { S.page = Number(pg.dataset.page); return updateTxnArea(); }
  if (t.closest('[data-eye]')) {
    S.hide = !S.hide;
    try { localStorage.setItem('hm_hide', S.hide ? '1' : '0'); } catch { /* abaikan */ }
    return render();
  }
  if (t.closest('[data-bulkdel]')) {
    if (!confirm(`Hapus ${S.sel.size} transaksi terpilih?`)) return;
    return deleteTxns([...S.sel]);
  }
  if (t.closest('[data-clearsel]')) { S.sel.clear(); return updateTxnArea(); }
  if (t.closest('[data-del-edit]')) {
    if (!confirm('Hapus transaksi ini?')) return;
    const id = $('#form-edit').txnId.value;
    $('#dlg-edit').close();
    return deleteTxns([id]);
  }
  const db = t.closest('[data-delbudget]');
  if (db) {
    if (!confirm('Hapus anggaran kategori ini?')) return;
    const { error } = await sb.from('budgets').delete().eq('id', db.dataset.delbudget);
    if (error) return toast(error.message);
    return refresh();
  }
  const cp = t.closest('[data-copy]');
  if (cp) {
    try { await navigator.clipboard.writeText(cp.dataset.copy); toast('Kode disalin'); }
    catch { toast('Salin manual: ' + cp.dataset.copy); }
    return;
  }
  const cls = t.closest('[data-close]');
  if (cls) return cls.closest('dialog').close();
  if (t.closest('#btn-bell')) {
    const p = S.txns.find((x) => x.status === 'pending' && x.owner_id === myId());
    return p ? openWithdraw(p.id) : toast('Tidak ada pengingat baru');
  }
  if (t.closest('#btn-avatar')) { S.view = 'pengaturan'; return render(); }
  if (t.closest('#btn-logout')) return sb.auth.signOut();
  if (t.closest('#btn-signup')) {
    const f = $('#form-login');
    if (!f.email.value || f.password.value.length < 6) return toast('Isi email dan password (min. 6 karakter) dulu');
    const { error } = await sb.auth.signUp({ email: f.email.value, password: f.password.value });
    toast(error ? error.message : 'Akun dibuat. Silakan tekan Masuk.');
  }
});

document.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const id = f.getAttribute('id');
  if (id === 'form-login') {
    const { error } = await sb.auth.signInWithPassword({ email: f.email.value, password: f.password.value });
    if (error) toast(error.message);
  } else if (id === 'form-onboard') {
    const fd = new FormData(f);
    const isCreate = fd.get('mode') === 'create';
    const { error } = await sb.rpc(isCreate ? 'create_family' : 'join_family', isCreate
      ? { p_name: fd.get('family'), p_my_name: fd.get('name') }
      : { p_code: fd.get('family'), p_my_name: fd.get('name') });
    if (error) return toast(error.message);
    const { data: { session } } = await sb.auth.getSession();
    route(session);
  } else if (id === 'form-add') await saveTxn(f);
  else if (id === 'form-withdraw') await saveWithdraw(f);
  else if (id === 'form-edit') await saveEdit(f);
  else if (id === 'form-account') await saveAccount(f);
  else if (id === 'form-budget') await saveBudget(f);
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'f-q') { S.f.q = t.value; S.page = 1; updateTxnArea(); }
  // kategori otomatis saat mengetik keterangan
  if (t.name === 'desc' && t.closest('#form-add')) {
    const f = t.closest('form');
    if (f.category.dataset.manual) return;
    const type = f.dataset.type || 'expense';
    if (type === 'income') {
      const g = guess(t.value);
      f.category.value = CAT_IN.includes(g) ? g : 'Pemasukan Lain';
    } else {
      const g = guess(t.value);
      f.category.value = CAT_OUT.includes(g) ? g : 'Lainnya';
    }
  }
});

document.addEventListener('change', (e) => {
  const t = e.target;
  const map = { 'f-range': 'range', 'f-cat': 'cat', 'f-acc': 'acc', 'f-kind': 'kind' };
  if (map[t.id]) { S.f[map[t.id]] = t.value; S.page = 1; return updateTxnArea(); }
  if (t.id === 'month') { S.month = t.value; S.page = 1; return render(); }
  if (t.name === 'category' && t.closest('#form-add')) t.dataset.manual = '1';
  if (t.name === 'mode' && t.closest('#form-withdraw')) $('#wd-spend').classList.toggle('hidden', t.value === 'wallet');
  if (t.dataset.sel) {
    if (t.checked) S.sel.add(t.dataset.sel); else S.sel.delete(t.dataset.sel);
    return updateTxnArea();
  }
  if (t.hasAttribute('data-selall')) {
    S.pageOwnIds.forEach((id) => (t.checked ? S.sel.add(id) : S.sel.delete(id)));
    return updateTxnArea();
  }
});

document.addEventListener('visibilitychange', () => { if (!document.hidden && S.profile) refresh(); });

// ================= Mulai =================
document.querySelectorAll('[data-i]').forEach((el) => { el.innerHTML = ic(el.dataset.i); });
fillMonths();
sb.auth.onAuthStateChange((evt, session) => {
  if (evt === 'TOKEN_REFRESHED') return;
  route(session);
});
