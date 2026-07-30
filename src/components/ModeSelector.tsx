import type { GameMode } from '../lib/game';

interface ModeSelectorProps {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}

const OPTIONS: { value: GameMode; label: string; desc: string }[] = [
  { value: 'limited', label: '9구 제한', desc: '9번째에도 못 맞히면 삼진 아웃' },
  { value: 'unlimited', label: '무제한', desc: '맞힐 때까지 계속' },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`mode-btn${opt.value === mode ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="mode-label">{opt.label}</span>
          <span className="mode-desc">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
