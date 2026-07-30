import { useCallback, useEffect, useMemo, useState } from 'react';
import {isOut, isWin, judge, makeSecret } from '../lib/game';




export function useNumberBaseball(digitCount: number) {

  interface HistoryEntry {
    guess: number[];
    strike: number;
    ball: number;
  }

  const [secret, setSecret] = useState<number[]>(() => makeSecret(digitCount));
  const [input, setInput] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [turns, setTurns] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const availableDigits = useMemo(
    () => Array.from({ length: 9 }, (_, i) => i + 1),
    []
  );

  const hint = useMemo(() => {
    if (gameOver) {
      return `${turns}번 만에 성공! 정답: ${secret.join('')}`;
    }
    if (history.length === 0) {
      return `1~9 숫자 ${digitCount}개를 눌러 입력하세요 (중복 없이)`;
    }
    const last = history[history.length - 1];
    return `${last.strike} 스트라이크 / ${last.ball} 볼 — 계속 입력하세요`;
  }, [gameOver, turns, secret, history, digitCount]);

  const newGame = useCallback(() => {
    setSecret(makeSecret(digitCount));
    setInput([]);
    setGameOver(false);
    setTurns(0);
    setHistory([]);
  }, [digitCount]);

  // Re-seed whenever the digit count (difficulty) changes.
  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digitCount]);

  const onDigit = useCallback(
    (n: number) => {
      if (gameOver) return;
      setInput((prev) => {
        if (prev.length >= digitCount || prev.includes(n)) return prev;
        return [...prev, n];
      });
    },
    [gameOver, digitCount]
  );

  const onDelete = useCallback(() => {
    if (gameOver) return;
    setInput((prev) => prev.slice(0, -1));
  }, [gameOver]);

  const onSubmit = useCallback(() => {
    if (gameOver || input.length !== digitCount) return;
    const result = judge(input, secret);
    setTurns((t) => t + 1);
    setHistory((prev) => [...prev, { guess: input, ...result }]);

    if (isWin(result, digitCount)) {
      setGameOver(true);
    } else {
      setInput([]);
    }
  }, [gameOver, input, digitCount, secret]);

  // Physical keyboard support: 1-9 to enter, Backspace to delete, Enter to submit.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '9') {
        onDigit(Number(e.key));
      } else if (e.key === 'Backspace') {
        onDelete();
      } else if (e.key === 'Enter') {
        onSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDigit, onDelete, onSubmit]);

  return {
    digitCount,
    input,
    gameOver,
    turns,
    history,
    hint,
    availableDigits,
    onDigit,
    onDelete,
    onSubmit,
    newGame,
    canSubmit: !gameOver && input.length === digitCount,
    isOutRow: isOut,
  };
}
