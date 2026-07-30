interface DigitSlotsProps {
  digitCount: number;
  input: number[];
  gameOver: boolean;
}

export function DigitSlots({ digitCount, input, gameOver }: DigitSlotsProps) {
  return (
    <div className="digits">
      {Array.from({ length: digitCount }, (_, i) => {
        const filled = i < input.length;
        const isCursor = i === input.length && !gameOver;
        const classes = [
          'digit-slot',
          filled ? 'filled' : '',
          isCursor ? 'cursor' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <div key={i} className={classes}>
            {filled ? input[i] : ''}
          </div>
        );
      })}
    </div>
  );
}
