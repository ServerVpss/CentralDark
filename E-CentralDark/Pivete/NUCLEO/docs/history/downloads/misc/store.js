const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const TERMS = path.join(DATA_DIR, 'terms.json');
const PENDING = path.join(DATA_DIR, 'pending.json');
const PAID = path.join(DATA_DIR, 'paid.json');
const SUBSCRIPTIONS = path.join(DATA_DIR, 'subscriptions.json');

async function ensure() {
  await fs.ensureDir(DATA_DIR);
  if (!(await fs.pathExists(PENDING))) await fs.writeJson(PENDING, []);
  if (!(await fs.pathExists(PAID))) await fs.writeJson(PAID, []);
  if (!(await fs.pathExists(TERMS))) await fs.writeJson(TERMS, {});
  if (!(await fs.pathExists(SUBSCRIPTIONS))) await fs.writeJson(SUBSCRIPTIONS, {});
}

// ===== Pending/Paid =====
async function allPending() { 
  await ensure(); 
  return fs.readJson(PENDING); 
}

async function allPaid() { 
  await ensure(); 
  return fs.readJson(PAID); 
}

async function addPending(item) {
  await ensure();
  const arr = await fs.readJson(PENDING);
  const idx = arr.findIndex(x => x.txid === item.txid);
  if (idx >= 0) arr[idx] = item; 
  else arr.push(item);
  await fs.writeJson(PENDING, arr, { spaces: 2 });
}

async function markPaid(txid, extra = {}) {
  await ensure();
  const pend = await fs.readJson(PENDING);
  const idx = pend.findIndex(x => x.txid === txid);
  let item = { txid, ...extra };
  if (idx >= 0) {
    item = { ...pend[idx], ...extra };
    pend.splice(idx, 1);
    await fs.writeJson(PENDING, pend, { spaces: 2 });
  }
  const paid = await fs.readJson(PAID);
  paid.push({ ...item, paidAt: new Date().toISOString() });
  await fs.writeJson(PAID, paid, { spaces: 2 });
}

async function removePending(txid) {
  await ensure();
  const pend = await fs.readJson(PENDING);
  const filtered = pend.filter(x => x.txid !== txid);
  await fs.writeJson(PENDING, filtered, { spaces: 2 });
}

// ===== Terms =====
async function getTermsStatus(userId) {
  await ensure();
  const terms = await fs.readJson(TERMS);
  return terms[String(userId)] || { accepted: false, at: null };
}

async function setTermsStatus(userId, accepted) {
  await ensure();
  const terms = await fs.readJson(TERMS);
  terms[String(userId)] = { 
    accepted: !!accepted, 
    at: new Date().toISOString() 
  };
  await fs.writeJson(TERMS, terms, { spaces: 2 });
  return terms[String(userId)];
}

// ===== Subscriptions =====
async function getSubscription(userId) {
  await ensure();
  const subs = await fs.readJson(SUBSCRIPTIONS);
  return subs[String(userId)] || null;
}

async function addSubscription(data) {
  await ensure();
  const subs = await fs.readJson(SUBSCRIPTIONS);
  const userId = String(data.userId);
  
  // Se já existe, soma os dias
  const existing = subs[userId];
  if (existing && isActive(existing)) {
    // Estende a assinatura existente
    const currentExpires = moment(existing.expiresAt);
    const newExpires = currentExpires.add(data.planDays, 'days');
    
    subs[userId] = {
      ...existing,
      lastRenewalAt: new Date().toISOString(),
      expiresAt: newExpires.toISOString(),
      renewalHistory: [
        ...(existing.renewalHistory || []),
        {
          txid: data.txid,
          planCode: data.planCode,
          planName: data.planName,
          value: data.value,
          addedDays: data.planDays,
          at: new Date().toISOString()
        }
      ]
    };
  } else {
    // Nova assinatura
    subs[userId] = {
      userId: data.userId,
      planCode: data.planCode,
      planName: data.planName,
      planDays: data.planDays,
      txid: data.txid,
      value: data.value,
      startedAt: data.startedAt,
      expiresAt: data.expiresAt,
      renewalHistory: []
    };
  }
  
  await fs.writeJson(SUBSCRIPTIONS, subs, { spaces: 2 });
  return subs[userId];
}

function isActive(subscription) {
  if (!subscription || !subscription.expiresAt) return false;
  return moment(subscription.expiresAt).isAfter(moment());
}

async function getAllSubscriptions() {
  await ensure();
  return fs.readJson(SUBSCRIPTIONS);
}

async function cleanExpiredSubscriptions() {
  await ensure();
  const subs = await fs.readJson(SUBSCRIPTIONS);
  const cleaned = {};
  
  for (const [userId, sub] of Object.entries(subs)) {
    if (isActive(sub)) {
      cleaned[userId] = sub;
    }
  }
  
  await fs.writeJson(SUBSCRIPTIONS, cleaned, { spaces: 2 });
}

module.exports = {
  allPending,
  allPaid,
  addPending,
  markPaid,
  removePending,
  getTermsStatus,
  setTermsStatus,
  getSubscription,
  addSubscription,
  isActive,
  getAllSubscriptions,
  cleanExpiredSubscriptions
};
