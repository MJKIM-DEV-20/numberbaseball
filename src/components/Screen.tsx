import type {HistoryEntry} from "../lib/game.ts";
import { DigitSlots } from './DigitSlots';
import { HistoryList } from './HistoryList';

interface ScreenProps {
  digitCount: number;
  input: number[];
  gameOver: boolean;
  hint: string;
  history: HistoryEntry[];
}

export function Screen({ digitCount, input, gameOver, hint, history }: ScreenProps) {
  return (
    <div className="screen">
      <div className="status-row">
        <span>SCORE-{digitCount}</span>
        <span style={{ letterSpacing: '2px' }}>
          {gameOver ? '완료' : '●'.repeat(digitCount)}
        </span>
      </div>
      <DigitSlots digitCount={digitCount} input={input} gameOver={gameOver} />
      <div className="hint">{hint}</div>
      <HistoryList history={history} />
    </div>
  );
}
