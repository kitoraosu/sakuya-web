import { MODES } from '../lib/modes';

// Переключатель игровых режимов
export default function ModeTabs({
  value,
  onChange,
}: {
  value: number;
  onChange: (mode: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            value === m.id
              ? 'bg-pink-500 text-white'
              : 'border border-zinc-700 text-zinc-400 hover:border-pink-500/50 hover:text-pink-300'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
