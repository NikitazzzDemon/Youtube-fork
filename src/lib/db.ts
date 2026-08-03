import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Subscription, HistoryItem } from '../types';

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  subscriptions: Record<string, Subscription[]>; // userId -> array
  history: Record<string, HistoryItem[]>; // userId -> array
  savedVideos: Record<string, string[]>; // userId -> videoIds
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'glasstube_db.json');

// Ensure directory and db file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading DB file:', e);
  }

  const defaultDb: DatabaseSchema = {
    users: [],
    subscriptions: {},
    history: {},
    savedVideos: {},
  };
  saveData(defaultDb);
  return defaultDb;
}

function saveData(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB file:', e);
  }
}

// Initialize seed user if empty
export async function initDb() {
  const db = loadData();
  if (db.users.length === 0) {
    const defaultHash = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 'usr_admin',
      email: 'admin@glasstube.vps',
      name: 'VPS Owner',
      passwordHash: defaultHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(adminUser);
    db.subscriptions[adminUser.id] = [
      {
        channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        channelName: 'Google Developers',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_k2L0Zg',
        dateAdded: new Date().toISOString(),
      },
      {
        channelId: 'UCWv7vMbMWH4-V0ZXgpyX54A',
        channelName: 'Veritasium',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_m65N1a',
        dateAdded: new Date().toISOString(),
      },
    ];
    saveData(db);
    console.log('[DB] Seeding default private user (admin@glasstube.vps / admin123)');
  }
}

export function getUserByEmail(email: string) {
  const db = loadData();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string) {
  const db = loadData();
  const u = db.users.find((user) => user.id === id);
  if (!u) return null;
  const { passwordHash, ...userWithoutPassword } = u;
  return userWithoutPassword;
}

export async function createUser(email: string, passwordRaw: string, name: string) {
  const db = loadData();
  if (getUserByEmail(email)) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(passwordRaw, 10);
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.subscriptions[newUser.id] = [];
  db.history[newUser.id] = [];
  db.savedVideos[newUser.id] = [];
  saveData(db);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export function getSubscriptions(userId: string): Subscription[] {
  const db = loadData();
  return db.subscriptions[userId] || [];
}

export function addSubscription(userId: string, sub: Omit<Subscription, 'dateAdded'>) {
  const db = loadData();
  if (!db.subscriptions[userId]) db.subscriptions[userId] = [];
  const exists = db.subscriptions[userId].some((s) => s.channelId === sub.channelId);
  if (!exists) {
    db.subscriptions[userId].unshift({
      ...sub,
      dateAdded: new Date().toISOString(),
    });
    saveData(db);
  }
  return db.subscriptions[userId];
}

export function removeSubscription(userId: string, channelId: string) {
  const db = loadData();
  if (db.subscriptions[userId]) {
    db.subscriptions[userId] = db.subscriptions[userId].filter((s) => s.channelId !== channelId);
    saveData(db);
  }
  return db.subscriptions[userId] || [];
}

export function getHistory(userId: string): HistoryItem[] {
  const db = loadData();
  return db.history[userId] || [];
}

export function addToHistory(userId: string, item: Omit<HistoryItem, 'id' | 'watchedAt'>) {
  const db = loadData();
  if (!db.history[userId]) db.history[userId] = [];
  
  // Remove duplicate if already in history
  db.history[userId] = db.history[userId].filter((h) => h.videoId !== item.videoId);

  const newHist: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}`,
    watchedAt: new Date().toISOString(),
  };

  db.history[userId].unshift(newHist);
  // Keep last 100 history items
  db.history[userId] = db.history[userId].slice(0, 100);
  saveData(db);

  return db.history[userId];
}

export function clearHistory(userId: string) {
  const db = loadData();
  db.history[userId] = [];
  saveData(db);
  return [];
}

export function getSavedVideoIds(userId: string): string[] {
  const db = loadData();
  return db.savedVideos[userId] || [];
}

export function toggleSavedVideo(userId: string, videoId: string): boolean {
  const db = loadData();
  if (!db.savedVideos[userId]) db.savedVideos[userId] = [];
  const idx = db.savedVideos[userId].indexOf(videoId);
  let isSaved = false;
  if (idx >= 0) {
    db.savedVideos[userId].splice(idx, 1);
  } else {
    db.savedVideos[userId].push(videoId);
    isSaved = true;
  }
  saveData(db);
  return isSaved;
}
