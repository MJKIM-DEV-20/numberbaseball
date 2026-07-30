export interface JudgeResult {
  strike: number;
  ball: number;
}

export type HistoryEntry ={
  guess: number[];
  strike: number;
  ball: number;
}

/**
 * Fisher-Yates shuffle of the digit pool 1..9, then take the first `count`.
 * Produces a secret with no repeated digits.
 */
export function makeSecret(count: number): number[] {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Strike = right digit, right position. Ball = right digit, wrong position. */
export function judge(guess: number[], secret: number[]): JudgeResult {
  let strike = 0;
  let ball = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      strike++;
    } else if (secret.includes(guess[i])) {
      ball++;
    }
  }
  return { strike, ball };
}

export function isOut(result: JudgeResult): boolean {
  return result.strike === 0 && result.ball === 0;
}

export function isWin(result: JudgeResult, digitCount: number): boolean {
  return result.strike === digitCount;
}