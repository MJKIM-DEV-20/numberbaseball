interface DifficultySelectorProps {
  digitCount: number;
  onChange: (count: number) => void;
}

const OPTIONS = [3, 4, 5];

export function DifficultySelector({ digitCount, onChange }: DifficultySelectorProps) {
  return (
    <div className="option-row">
      <span className="option-label">자릿수</span>
      <div className="option-buttons">
        {OPTIONS.map((n) => (
          <button
            key={n}
            className={`option-btn${n === digitCount ? ' active' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}자리
          </button>
        ))}
      </div>
    </div>
  );
}
