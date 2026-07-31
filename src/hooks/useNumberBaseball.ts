// @vitest-environment jsdom
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isWin,
  judge,
  makeSecret,
  MAX_TRIES,
  type GameMode,
  type HistoryEntry,
} from '../lib/game';

export type GameStatus = 'playing' | 'won' | 'lost';

export function useNumberBaseball(digitCount: number, mode: GameMode) {
  const [secret, setSecret] = useState<number[]>(() => makeSecret(digitCount));
  const [input, setInput] = useState<number[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const gameOver = status !== 'playing';

  const newGame = useCallback(() => {
    setSecret(makeSecret(digitCount));
    setInput([]);
    setStatus('playing');
    setHistory([]);
  }, [digitCount]);

  // 자릿수(난이도) 또는 모드가 바뀌면 새 게임으로 리셋
  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digitCount, mode]);

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

  // 이미 시도한 조합인지 확인 (중복 제출 방지)
  const isDuplicateGuess = useMemo(
      () => history.some((entry) => entry.guess.join('') === input.join('')),
      [history, input]
  );

  const onSubmit = useCallback(() => {
    if (gameOver || input.length !== digitCount) return;
    if (history.some((entry) => entry.guess.join('') === input.join(''))) return; // 중복 시도 방지

    const result = judge(input, secret);
    const nextHistory = [...history, { guess: input, ...result }];
    setHistory(nextHistory);
    setInput([]);

    if (isWin(result, digitCount)) {
      setStatus('won');
    } else if (mode === 'limited' && nextHistory.length >= MAX_TRIES) {
      setStatus('lost');
    }
  }, [gameOver, input, digitCount, secret, history, mode]);

  // 물리 키보드 지원: 1-9 입력, Backspace 삭제, Enter 제출
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

  const lastEntry = history[history.length - 1];
  const triesLeft = mode === 'limited' ? MAX_TRIES - history.length : null;

  const hint = useMemo(() => {
    if (status === 'won') {
      return `${history.length}번 만에 홈런! 정답은 ${secret.join(' ')}`;
    }
    if (status === 'lost') {
      return `삼진 아웃! 정답은 ${secret.join(' ')}였습니다`;
    }
    if (input.length === digitCount && isDuplicateGuess) {
      return '이미 시도한 조합이에요. 다른 숫자로 도전해보세요';
    }
    if (!lastEntry) {
      return `1~9 숫자 ${digitCount}개를 중복 없이 입력하세요`;
    }
    return `${lastEntry.strike} 스트라이크 / ${lastEntry.ball} 볼 — 계속 입력하세요`;
  }, [status, history.length, secret, lastEntry, digitCount, input, isDuplicateGuess]);

  return {
    digitCount,
    mode,
    input,
    status,
    gameOver,
    history,
    hint,
    lastEntry,
    triesLeft,
    secret,
    isDuplicateGuess,
    onDigit,
    onDelete,
    onSubmit,
    newGame,
    canSubmit: !gameOver && input.length === digitCount && !isDuplicateGuess,
  };
}