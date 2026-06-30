import path from 'path';
import { promises as fs } from 'fs';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import { config, MYSQL_CONFIGURED } from './config.js';
import { query } from './db.js';
import { md5Hex } from './auth.service.js';

export interface MyAccount {
  id: number;
  name: string;
  email: string;
  country: string;
  priv: number;
  has_banner: boolean;
}

export function bannerPath(id: number): string {
  return path.join(config.bannersDir, `${id}.jpg`);
}

export async function hasBanner(id: number): Promise<boolean> {
  try {
    await fs.access(bannerPath(id));
    return true;
  } catch {
    return false;
  }
}

export async function getMyAccount(id: number): Promise<MyAccount | null> {
  if (!MYSQL_CONFIGURED) return null;
  const rows = await query<{
    id: number;
    name: string;
    email: string;
    country: string;
    priv: number;
  }>('SELECT id, name, email, country, priv FROM users WHERE id = ? LIMIT 1', [id]);
  const u = rows[0];
  if (!u) return null;
  return { ...u, has_banner: await hasBanner(id) };
}

export class PasswordError extends Error {}

// Смена пароля: проверяем текущий, валидируем новый, обновляем pw_bcrypt
export async function changePassword(
  id: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!MYSQL_CONFIGURED) throw new PasswordError('Unavailable');

  const rows = await query<{ pw_bcrypt: string }>(
    'SELECT pw_bcrypt FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  const user = rows[0];
  if (!user) throw new PasswordError('User not found');

  const ok = await bcrypt.compare(md5Hex(currentPassword), user.pw_bcrypt);
  if (!ok) throw new PasswordError('Current password is incorrect');

  if (newPassword.length < 8 || newPassword.length > 32) {
    throw new PasswordError('New password must be 8-32 characters in length.');
  }
  if (new Set(newPassword).size <= 3) {
    throw new PasswordError('New password must have more than 3 unique characters.');
  }

  const pwBcrypt = await bcrypt.hash(md5Hex(newPassword), 10);
  await query('UPDATE users SET pw_bcrypt = ? WHERE id = ?', [pwBcrypt, id]);
}

// Сохранить аватар: квадрат 256x256 PNG в каталог аватаров bancho (a.<domain>/<id>)
export async function saveAvatar(id: number, buffer: Buffer): Promise<void> {
  const out = path.join(config.avatarsDir, `${id}.png`);
  const png = await sharp(buffer).resize(256, 256, { fit: 'cover' }).png().toBuffer();
  await fs.writeFile(out, png);
}

// Сохранить баннер: широкая картинка 1500x500 JPG
export async function saveBanner(id: number, buffer: Buffer): Promise<void> {
  await fs.mkdir(config.bannersDir, { recursive: true });
  const jpg = await sharp(buffer)
    .resize(1500, 500, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toBuffer();
  await fs.writeFile(bannerPath(id), jpg);
}
