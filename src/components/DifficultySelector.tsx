interface DifficultySelectorProps {
  digitCount: number;
  onChange: (count: number) => void;
}

const OPTIONS = [3, 4, 5];

export function DifficultySelector({ digitCount, onChange }: DifficultySelectorProps) {
  return (
    <div className="difficulty">
      {OPTIONS.map((n) => (
        <button
          key={n}
          className={`diff-btn${n === digitCount ? ' active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}자리
        </button>
      ))}
    </div>
  );
}
