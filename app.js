import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ====== ISI DENGAN DATA PROJECT SUPABASE ANDA ======
const SUPABASE_URL = 'https://wlujjpviqxzbwrhubhxr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_55gDw1h8KqodyhqvIEFMOA_anV9i9NQ';
// ===================================================

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CAT_OUT = ['Belanja Bulanan', 'Listrik & Air', 'Transportasi', 'Makan', 'Pulsa & Internet', 'Kesehatan', 'Pendidikan', 'Hiburan', 'Cicilan', 'Lainnya'];
const CAT_IN = ['Gaji', 'Pemasukan Lain'];
const KIND = { bank: 'Bank', cash: 'Dompet Tunai', wallet: 'E-Wallet', savings: 'Tabungan' };
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const TITLES = { dashboard: 'Dashboard', transaksi: 'Transaksi', rekening: 'Rekening', pengaturan: 'Pengaturan' };

const S = {
  user: null, profile: null, family: null,
  accounts: [], txns: [], rules: [], members: [],
  scope: 'family', view: 'dashboard',
  month: new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 7),
};

// ---------- helper ----------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = (n) => (Number(n) < 0 ? '- ' : '') + 'Rp ' + Math.abs(Math.round(Number(n) || 0)).toLocaleString('id-ID');
const today = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const fmtDate = (d) => { const [y, m, dd] = d.split('-'); return `${Number(dd)} ${BULAN[m - 1]} ${y}`; };
const sumOf = (arr) => arr.reduce((s, t) => s + Number(t.amount), 0);
const show = (id, on) => $('#' + id).classList.toggle('hidden', !on);
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
const myId = () => S.user.id;
const famId = () => S.profile.family_id;
const memberName = (id) => S.members.find((m) => m.id === id)?.name || 'Pasangan';
const accName = (id) => S.accounts.find((a) => a.id === id)?.name || '—';
const isMine = (a) => a.owner_id === myId();
const isFamilyAcc = (a) => !a.owner_id;

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

function monthStats(list) {
  const m = list.filter((t) => t.txn_date.startsWith(S.month) && t.status === 'ok');
  return {
    income: sumOf(m.filter((t) => t.type === 'income')),
    expense: sumOf(m.filter((t) => t.type === 'expense' || (t.type === 'withdrawal' && !t.to_account_id))),
  };
}

// ---------- auth & data ----------
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
  const [a, t, r, m, f] = await Promise.all([
    sb.from('accounts').select('*').order('created_at'),
    sb.from('transactions').select('*').order('txn_date', { ascending: false }).order('created_at', { ascending: false }),
    sb.from('rules').select('*'),
    sb.from('profiles').select('id,name'),
    sb.from('families').select('*').eq('id', famId()).single(),
  ]);
  const err = [a, t, r, m, f].find((x) => x.error);
  if (err) return toast(err.error.message);
  Object.assign(S, { accounts: a.data, txns: t.data, rules: r.data, members: m.data, family: f.data });
  render();
}

async function learnRule(desc, category) {
  const kw = desc.toLowerCase().trim();
  if (!kw || S.rules.some((r) => r.family_id && r.keyword === kw && r.category === category)) return;
  await sb.from('rules').insert({ family_id: famId(), keyword: kw, category });
}

// ---------- render ----------
function render() {
  document.querySelectorAll('.nav').forEach((b) => b.classList.toggle('active', b.dataset.view === S.view));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('hidden', v.id !== 'view-' + S.view));
  $('#month').value = S.month;
  $('#title').textContent = TITLES[S.view];
  $('#sub').textContent = S.family ? `${S.family.name} · ${S.profile.name}` : '';

  const pend = S.txns.filter((t) => t.status === 'pending');
  const b = $('#banner');
  b.classList.toggle('hidden', !pend.length);
  b.innerHTML = pend.length
    ? `<span>Ada ${pend.length} tarik tunai menunggu dicatat.</span><button class="pill" data-classify="${pend[0].id}">Catat sekarang</button>`
    : '';

  ({ dashboard: renderDashboard, transaksi: renderTransaksi, rekening: renderRekening, pengaturan: renderPengaturan })[S.view]();
}

function scopeButtons() {
  return `<div class="seg">
    <button data-scope="family" class="${S.scope === 'family' ? 'on' : ''}">Keluarga</button>
    <button data-scope="mine" class="${S.scope === 'mine' ? 'on' : ''}">Saya</button>
  </div>`;
}

function renderDashboard() {
  const list = scoped();
  const st = monthStats(list);
  const bal = balances();
  const accs = S.scope === 'mine' ? S.accounts.filter((a) => isMine(a) || isFamilyAcc(a)) : S.accounts.filter(isFamilyAcc);
  const total = accs.reduce((s, a) => s + (bal[a.id] || 0), 0);
  const recent = list.filter((t) => t.status === 'ok').slice(0, 8);

  $('#view-dashboard').innerHTML = `
    ${scopeButtons()}
    <div class="cards">
      <div class="card"><small>Total Pemasukan</small><b class="green">${rp(st.income)}</b></div>
      <div class="card"><small>Total Pengeluaran</small><b class="red">${rp(st.expense)}</b></div>
      <div class="card hero"><small>Saldo Total ${S.scope === 'mine' ? 'Saya' : 'Keluarga'}</small><b>${rp(total)}</b></div>
    </div>
    <h3>Rekening & Tabungan</h3>
    <div class="accs">${accs.map((a) => `
      <div class="acc">
        <small>${KIND[a.kind]} · ${a.owner_id ? esc(memberName(a.owner_id)) : 'Keluarga'}</small>
        <span>${esc(a.name)}</span><b>${rp(bal[a.id] || 0)}</b>
      </div>`).join('') || '<p class="muted">Belum ada rekening. Tambah di tab Rekening.</p>'}
    </div>
    <h3>Transaksi terbaru</h3>
    ${txnList(recent)}`;
}

function txnList(list) {
  if (!list.length) return '<p class="muted">Belum ada transaksi.</p>';
  return `<div class="list">${list.map((t) => {
    const pend = t.status === 'pending';
    const isIn = t.type === 'income';
    const isWallet = t.type === 'withdrawal' && t.to_account_id;
    const cls = isIn ? 'green' : isWallet ? 'blue' : 'red';
    const sign = isIn ? '+ ' : isWallet ? '↔ ' : '- ';
    const title = pend ? 'Tarik tunai, perlu dicatat'
      : isWallet ? 'Tarik tunai ke dompet'
      : (t.description || '(tanpa keterangan)');
    const sub = [accName(t.account_id), t.category, memberName(t.owner_id), t.visibility === 'shared' ? 'Keluarga' : null]
      .filter(Boolean).join(' · ');
    return `<div class="row">
      <div class="date">${fmtDate(t.txn_date)}</div>
      <div class="desc"><b>${esc(title)}</b><small>${esc(sub)}</small></div>
      <div class="amt ${pend ? '' : cls}">${pend ? rp(t.amount) : sign + rp(t.amount)}</div>
      <div class="acts">
        ${pend ? `<button class="pill" data-classify="${t.id}">Catat</button>` : ''}
        ${t.owner_id === myId() ? `<button class="icon" data-del="${t.id}" title="Hapus">✕</button>` : ''}
      </div>
    </div>`;
  }).join('')}</div>`;
}

function renderTransaksi() {
  const accs = S.accounts.filter((a) => isMine(a) || isFamilyAcc(a));
  $('#view-transaksi').innerHTML = `
    <div class="top2">${scopeButtons()}<button class="ghost" id="btn-withdraw">+ Tarik tunai</button></div>
    <form id="form-add" class="panel">
      <h3 style="margin:0">Catat cepat</h3>
      ${accs.length ? '' : '<p class="muted">Tambah rekening dulu di tab Rekening.</p>'}
      <div class="grid">
        <input name="amount" type="number" inputmode="numeric" placeholder="Jumlah (Rp)" required min="1">
        <input name="desc" placeholder="Keterangan, misal: beli token listrik" required>
        <select name="type"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select>
        <select name="account">${accountOptions((a) => isMine(a) || isFamilyAcc(a))}</select>
        <select name="category" class="auto">${catOptions('expense', 'Lainnya')}</select>
      </div>
      <div class="row-btn">
        <label class="check"><input type="checkbox" name="shared" checked> Bagikan ke keluarga</label>
        <button class="primary">Simpan</button>
      </div>
    </form>
    <div class="panel">
      <h3 style="margin:0">Semua transaksi</h3>
      <input id="search" placeholder="Cari transaksi…">
      <div id="txn-list"></div>
    </div>`;
  bindAdd();
  renderTxnList();
}

function renderTxnList() {
  const el = $('#txn-list'); if (!el) return;
  const q = ($('#search')?.value || '').toLowerCase();
  const list = scoped().filter((t) => !q || (t.description || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
  el.innerHTML = txnList(list.slice(0, 200));
}

function bindAdd() {
  const f = $('#form-add'); if (!f) return;
  f.desc.addEventListener('input', () => {
    if (f.category.dataset.manual) return;
    const g = guess(f.desc.value);
    f.category.value = [...f.category.options].some((o) => o.value === g) ? g : 'Lainnya';
  });
  f.type.addEventListener('change', () => {
    f.category.innerHTML = catOptions(f.type.value, guess(f.desc.value));
    delete f.category.dataset.manual;
  });
  f.category.addEventListener('change', () => { f.category.dataset.manual = '1'; });
}

function renderRekening() {
  const bal = balances();
  $('#view-rekening').innerHTML = `
    <form id="form-account" class="panel">
      <h3 style="margin:0">Tambah rekening / dompet</h3>
      <div class="grid">
        <input name="name" placeholder="Nama, misal: BCA Utama" required>
        <select name="kind">
          <option value="bank">Bank</option>
          <option value="cash">Dompet Tunai</option>
          <option value="wallet">E-Wallet</option>
          <option value="savings">Tabungan</option>
        </select>
        <input name="opening" type="number" placeholder="Saldo awal (Rp)" value="0">
        <select name="owner"><option value="me">Milik saya</option><option value="family">Keluarga (bersama)</option></select>
      </div>
      <div class="row-btn"><span class="muted">Dompet Tunai dipakai untuk uang tarik tunai yang belum dibelanjakan.</span><button class="primary">Tambah</button></div>
    </form>
    <div class="accs">${S.accounts.map((a) => `
      <div class="acc">
        <small>${KIND[a.kind]} · ${a.owner_id ? esc(memberName(a.owner_id)) : 'Keluarga'}</small>
        <span>${esc(a.name)}</span><b>${rp(bal[a.id] || 0)}</b>
      </div>`).join('')}
    </div>`;
}

function renderPengaturan() {
  $('#view-pengaturan').innerHTML = `
    <div class="panel">
      <h3 style="margin:0">Keluarga</h3>
      <p>Nama keluarga: <b>${esc(S.family?.name)}</b></p>
      <p>Kode undangan untuk pasangan: <span class="code">${esc(S.family?.invite_code)}</span></p>
      <p class="muted">Login sebagai ${esc(S.user.email)}</p>
      <div><button class="ghost" id="btn-logout">Keluar</button></div>
    </div>`;
}

// ---------- actions ----------
async function saveTxn(f) {
  const account = S.accounts.find((a) => a.id === f.account.value);
  if (!account) return toast('Pilih rekening dulu');
  const desc = f.desc.value.trim();
  const category = f.category.value;
  if (f.category.dataset.manual) await learnRule(desc, category);

  const { error } = await sb.from('transactions').insert({
    family_id: famId(), owner_id: myId(), account_id: account.id,
    type: f.type.value, amount: Number(f.amount.value),
    description: desc, category,
    visibility: isFamilyAcc(account) || f.shared.checked ? 'shared' : 'private',
    status: 'ok', txn_date: today(), source: 'manual',
  });
  if (error) return toast(error.message);
  toast('Tersimpan');
  f.reset();
  await refresh();
}

function openWithdraw(pendingId) {
  const dlg = $('#dlg-withdraw');
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
  dlg.showModal();
}

async function saveWithdraw(f) {
  const mode = f.querySelector('[name=mode]:checked').value;
  const cashId = f.cash.value || null;
  const desc = f.desc.value.trim();
  if (mode === 'wallet' && !cashId) return toast('Buat rekening Dompet Tunai dulu di tab Rekening');

  const account = S.accounts.find((a) => a.id === f.account.value);
  const fields = mode === 'wallet'
    ? { to_account_id: cashId, category: null, description: 'Tarik tunai (dompet)' }
    : { to_account_id: null, category: f.category.value, description: desc || 'Tarik tunai' };
  if (mode === 'spend' && desc) await learnRule(desc, f.category.value);

  const payload = {
    ...fields, type: 'withdrawal', account_id: account.id,
    amount: Number(f.amount.value), status: 'ok',
  };
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

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const t = e.target;
  const v = t.closest('[data-view]');
  if (v) { S.view = v.dataset.view; return render(); }
  const sc = t.closest('[data-scope]');
  if (sc) { S.scope = sc.dataset.scope; return render(); }
  const cl = t.closest('[data-classify]');
  if (cl) return openWithdraw(cl.dataset.classify);
  const del = t.closest('[data-del]');
  if (del) {
    if (!confirm('Hapus transaksi ini?')) return;
    const { error } = await sb.from('transactions').delete().eq('id', del.dataset.del);
    if (error) return toast(error.message);
    return refresh();
  }
  if (t.closest('[data-close]')) return $('#dlg-withdraw').close();
  if (t.closest('#btn-withdraw')) return openWithdraw();
  if (t.closest('#btn-logout')) return sb.auth.signOut();
  if (t.closest('#btn-signup')) {
    const f = $('#form-login');
    const { error } = await sb.auth.signUp({ email: f.email.value, password: f.password.value });
    toast(error ? error.message : 'Akun dibuat.');
  }
});

document.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'form-login') {
    const { error } = await sb.auth.signInWithPassword({ email: f.email.value, password: f.password.value });
    if (error) toast(error.message);
  } else if (f.id === 'form-onboard') {
    const fd = new FormData(f);
    const isCreate = fd.get('mode') === 'create';
    const { error } = await sb.rpc(isCreate ? 'create_family' : 'join_family', isCreate
      ? { p_name: fd.get('family'), p_my_name: fd.get('name') }
      : { p_code: fd.get('family'), p_my_name: fd.get('name') });
    if (error) return toast(error.message);
    const { data: { session } } = await sb.auth.getSession();
    route(session);
  } else if (f.id === 'form-add') {
    await saveTxn(f);
  } else if (f.id === 'form-withdraw') {
    await saveWithdraw(f);
  } else if (f.id === 'form-account') {
    await saveAccount(f);
  }
});

document.addEventListener('input', (e) => { if (e.target.id === 'search') renderTxnList(); });
document.addEventListener('change', (e) => {
  if (e.target.name === 'mode' && e.target.closest('#form-withdraw')) {
    $('#wd-spend').classList.toggle('hidden', e.target.value === 'wallet');
  }
  if (e.target.id === 'month') { S.month = e.target.value; render(); }
});
$('#month').addEventListener('change', (e) => { S.month = e.target.value; render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.profile) refresh(); });

sb.auth.onAuthStateChange((evt, session) => {
  if (evt === 'TOKEN_REFRESHED') return;
  route(session);
});
