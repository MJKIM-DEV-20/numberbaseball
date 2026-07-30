interface KeypadProps {
  digitCount: number;
  input: number[];
  gameOver: boolean;
  canSubmit: boolean;
  onDigit: (n: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function Keypad({
  digitCount,
  input,
  gameOver,
  canSubmit,
  onDigit,
  onDelete,
  onSubmit,
  onReset,
}: KeypadProps) {
  return (
    <div className="keypad">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
        const used = input.includes(n);
        const disabled = used || input.length >= digitCount || gameOver;
        return (
          <button
            key={n}
            className="key"
            disabled={disabled}
            onClick={() => onDigit(n)}
          >
            {n}
          </button>
        );
      })}

      <button className="key func" disabled={gameOver} onClick={onDelete}>
        지움<span className="sub">DEL</span>
      </button>

      <button className="key func" onClick={onReset}>
        새게임<span className="sub">RESET</span>
      </button>

      <button className="key enter" disabled={!canSubmit} onClick={onSubmit}>
        확인<span className="sub">ENTER</span>
      </button>
    </div>
  );
}
