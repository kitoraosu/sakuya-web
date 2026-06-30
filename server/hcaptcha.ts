import { config } from './config.js';

// Проверка hCaptcha-токена через siteverify.
// Если секрет не задан — пропускаем (dev), чтобы не блокировать локальную разработку.
export async function verifyCaptcha(token: string, remoteip?: string): Promise<boolean> {
  if (!config.hcaptchaSecret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret: config.hcaptchaSecret, response: token });
  if (remoteip) body.set('remoteip', remoteip);

  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[hcaptcha]', err);
    return false;
  }
}
