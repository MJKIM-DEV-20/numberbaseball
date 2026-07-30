import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../lib/game';

interface HistoryListProps {
  history: HistoryEntry[];
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
          <div className="empty-history">기록 없음</div>
        </div>
    );
  }

  return (
      <div className="history" ref={scrollRef}>
        {history.map((entry, idx) => {
          const out = entry.strike === 0 && entry.ball === 0;
          return (
              <div className="history-row" key={idx}>
                <span className="guess">{entry.guess.join(' ')}</span>
                <span className="result">
              {out ? (
                  <span className="out">아웃</span>
              ) : (
                  <>
                    <span className="s">{entry.strike}S</span>{' '}
                    <span className="b">{entry.ball}B</span>
                  </>
              )}
            </span>
              </div>
          );
        })}
      </div>
  );
}