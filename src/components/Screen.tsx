import type { GameMode, HistoryEntry } from '../lib/game';
import { MAX_TRIES } from '../lib/game';
import { DigitSlots } from './DigitSlots';
import { HistoryList } from './HistoryList';

interface ScreenProps {
  digitCount: number;
  mode: GameMode;
  input: number[];
  gameOver: boolean;
  hint: string;
  history: HistoryEntry[];
  triesLeft: number | null;
}

export function Screen({ digitCount, mode, input, gameOver, hint, history, triesLeft }: ScreenProps) {
  return (
    <div className="screen">
      <div className="status-row">
        <span className="pitch-count">
          {history.length}구째
          {mode === 'limited' && <span className="dim"> / {MAX_TRIES}</span>}
        </span>
        {mode === 'limited' && triesLeft !== null && !gameOver && (
          <span className="tries-left">
            남은 기회 <strong>{triesLeft}</strong>
          </span>
        )}
      </div>

      <div className="rules-bar">
        <span>
          <span className="dot strike" />
          스트라이크: 숫자와 자리가 모두 일치
        </span>
        <span>
          <span className="dot ball" />볼: 숫자는 있지만 자리가 다름
        </span>
        <span>
          <span className="dot out" />
          아웃: 일치하는 숫자 없음
        </span>
      </div>

      <DigitSlots digitCount={digitCount} input={input} gameOver={gameOver} />
      <div className="hint">{hint}</div>
      <HistoryList history={history} />
    </div>
  );
}
