import type { GameStatus } from '../hooks/useNumberBaseball';

interface ResultPanelProps {
  status: GameStatus;
  secret: number[];
  tries: number;
  onRestart: () => void;
}

export function ResultPanel({ status, secret, tries, onRestart }: ResultPanelProps) {
  const won = status === 'won';
  return (
    <div className={`result-panel ${won ? 'won' : 'lost'}`}>
      <p className="result-title">{won ? '홈런!' : '삼진 아웃!'}</p>
      {won ? (
        <p className="result-sub">
          <strong>{tries}</strong>번 만에 맞췄어요
        </p>
      ) : (
        <p className="result-sub">9번 안에 맞히지 못했어요</p>
      )}
      <p className="result-secret">{secret.join(' ')}</p>
      <button className="restart-btn" onClick={onRestart}>
        다시 시작
      </button>
    </div>
  );
}
