import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../lib/game';

interface HistoryListProps {
  history: HistoryEntry[];
}

function ScoreDots({ type, count }: { type: 'strike' | 'ball'; count: number }) {
  return (
    <div className={`score-dots ${type}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`dot ${type}`} />
      ))}
    </div>
  );
}

export function HistoryList({ history }: HistoryListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="history" ref={scrollRef}>
        <div className="empty-history">아직 던진 공이 없습니다</div>
      </div>
    );
  }

  return (
    <div className="history" ref={scrollRef}>
      {history.map((entry, idx) => {
        const out = entry.strike === 0 && entry.ball === 0;
        return (
          <div className="history-row" key={idx}>
            <span className="pitch-index">{idx + 1}</span>
            <span className="guess">{entry.guess.join(' ')}</span>
            {out ? (
              <span className="out-badge">아웃</span>
            ) : (
              <span className="result-text">
                {entry.strike > 0 && (
                  <span className="result-strike">
                    <ScoreDots type="strike" count={entry.strike} />
                    스트라이크 {entry.strike}
                  </span>
                )}
                {entry.ball > 0 && (
                  <span className="result-ball">
                    <ScoreDots type="ball" count={entry.ball} />볼 {entry.ball}
                  </span>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
