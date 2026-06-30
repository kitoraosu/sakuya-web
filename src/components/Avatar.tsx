import { useState } from 'react';

// Аватар bancho.py отдаётся на a.<domain>/<userId>. Если недоступен — показываем инициал.
const AVATAR_BASE = 'https://a.sakuya.qzz.io';

export default function Avatar({
  id,
  name,
  size = 48,
}: {
  id: number;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-pink-500/20 font-bold text-pink-300"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`${AVATAR_BASE}/${id}`}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
