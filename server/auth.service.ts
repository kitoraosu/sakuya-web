import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config, MYSQL_CONFIGURED } from './config.js';
import pool, { query } from './db.js';
import type { BanchoUser, JwtPayload, PublicUser } from './types.js';

// bancho.py хранит пароль как bcrypt(md5(plaintext)).
export function md5Hex(plaintext: string): string {
  return crypto.createHash('md5').update(plaintext, 'utf8').digest('hex');
}

// safe_name в bancho.py: name.lower().replace(' ', '_')
function makeSafeName(name: string): string {
  return name.toLowerCase().replace(/ /g, '_');
}

// --- Mock-режим (когда БД не подключена) ---
let mockUserCache: BanchoUser | null = null;
async function getMockUser(): Promise<BanchoUser> {
  if (!mockUserCache) {
    const pw_bcrypt = await bcrypt.hash(md5Hex('sakuya'), 10);
    mockUserCache = {
      id: 3,
      name: 'Sakuya',
      safe_name: 'sakuya',
      email: 'sakuya@sakuya.local',
      priv: 1,
      pw_bcrypt,
      country: 'jp',
    };
  }
  return mockUserCache;
}

async function findUser(safeName: string): Promise<BanchoUser | null> {
  if (!MYSQL_CONFIGURED) {
    const mock = await getMockUser();
    return mock.safe_name === safeName ? mock : null;
  }
  const rows = await query<BanchoUser>(
    'SELECT id, name, safe_name, email, priv, pw_bcrypt, country FROM users WHERE safe_name = ? LIMIT 1',
    [safeName],
  );
  return rows[0] ?? null;
}

function toPublic(u: BanchoUser): PublicUser {
  return { id: u.id, name: u.name, country: u.country, priv: u.priv };
}

export function signToken(user: BanchoUser | PublicUser): string {
  const payload: JwtPayload = { id: user.id, name: user.name };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export async function login(username: string, password: string): Promise<LoginResult | null> {
  const user = await findUser(makeSafeName(username));
  if (!user) return null;
  const ok = await bcrypt.compare(md5Hex(password), user.pw_bcrypt);
  if (!ok) return null;
  return { token: signToken(user), user: toPublic(user) };
}

export async function getUserById(id: number): Promise<PublicUser | null> {
  if (!MYSQL_CONFIGURED) {
    const mock = await getMockUser();
    return mock.id === id ? toPublic(mock) : null;
  }
  const rows = await query<BanchoUser>(
    'SELECT id, name, safe_name, email, priv, pw_bcrypt, country FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ? toPublic(rows[0]) : null;
}

// ---------------- Регистрация (логика портирована из bancho.py) ----------------

const USERNAME_RE = /^[\w [\]-]{2,15}$/;
const EMAIL_RE = /^[^@\s]{1,200}@[^@\s.]{1,30}(?:\.[^@.\s]{2,24})+$/;
const DISALLOWED_NAMES = new Set(['mrekk', 'vaxei', 'btmc', 'cookiezi']);
const DISALLOWED_PASSWORDS = new Set(['password', 'abc123']);
const ALL_MODES = [0, 1, 2, 3, 4, 5, 6, 8];

export interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
}

export class RegisterError extends Error {
  errors: RegisterErrors;
  constructor(errors: RegisterErrors) {
    super('registration failed');
    this.errors = errors;
  }
}

// Возвращает {token, user} (автологин) либо бросает RegisterError с пофилдовыми ошибками
export async function register(
  username: string,
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!MYSQL_CONFIGURED || !pool) {
    throw new RegisterError({ username: 'Registration is currently unavailable.' });
  }

  const errors: RegisterErrors = {};

  // username
  if (!USERNAME_RE.test(username)) {
    errors.username = 'Must be 2-15 characters in length.';
  } else if (username.includes('_') && username.includes(' ')) {
    errors.username = 'May contain "_" and " ", but not both.';
  } else if (DISALLOWED_NAMES.has(username.toLowerCase())) {
    errors.username = 'Disallowed username; pick another.';
  }

  // email
  if (!EMAIL_RE.test(email)) {
    errors.email = 'Invalid email syntax.';
  }

  // password
  if (password.length < 8 || password.length > 32) {
    errors.password = 'Must be 8-32 characters in length.';
  } else if (new Set(password).size <= 3) {
    errors.password = 'Must have more than 3 unique characters.';
  } else if (DISALLOWED_PASSWORDS.has(password.toLowerCase())) {
    errors.password = 'That password was deemed too simple.';
  }

  // проверка занятости (только если базовая валидация прошла)
  const safeName = makeSafeName(username);
  if (!errors.username) {
    const taken = await query<{ id: number }>(
      'SELECT id FROM users WHERE safe_name = ? LIMIT 1',
      [safeName],
    );
    if (taken.length) errors.username = 'Username already taken by another player.';
  }
  if (!errors.email) {
    const taken = await query<{ id: number }>('SELECT id FROM users WHERE email = ? LIMIT 1', [
      email,
    ]);
    if (taken.length) errors.email = 'Email already taken by another player.';
  }

  if (Object.keys(errors).length) throw new RegisterError(errors);

  const pwBcrypt = await bcrypt.hash(md5Hex(password), 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      `INSERT INTO users (name, safe_name, email, pw_bcrypt, country, creation_time, latest_activity)
       VALUES (?, ?, ?, ?, 'xx', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [username, safeName, email, pwBcrypt],
    );
    const userId = (result as { insertId: number }).insertId;

    // stats для всех режимов
    const values = ALL_MODES.map(() => '(?, ?)').join(', ');
    const params = ALL_MODES.flatMap((m) => [userId, m]);
    await conn.execute(`INSERT INTO stats (id, mode) VALUES ${values}`, params);

    await conn.commit();

    const publicUser: PublicUser = { id: userId, name: username, country: 'xx', priv: 1 };
    return { token: signToken(publicUser), user: publicUser };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
