// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, fireEvent } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';

import { makeSecret, type GameMode } from '../src/lib/game';
import { useNumberBaseball } from '../src/hooks/useNumberBaseball';

// makeSecret은 랜덤이라 고정값으로 모킹 (judge, isWin, MAX_TRIES는 실제 구현 그대로 사용)
vi.mock('../src/lib/game', async () => {
    const actual = await vi.importActual<typeof import('../src/lib/game')>('../src/lib/game');
    return {
        ...actual,
        makeSecret: vi.fn(),
    };
});

/**
 * onDigit(N회) + onSubmit을 별도의 act()로 나눠서 실행하는 헬퍼.
 *
 * 왜 나눠야 하는가: React는 act() 콜백이 끝날 때까지 상태 업데이트를 배칭한다.
 * 같은 act() 안에서 onDigit을 여러 번 호출한 뒤 바로 onSubmit을 호출하면,
 * onSubmit은 아직 리렌더링 전(=input이 갱신되기 전)의 "이전 렌더 클로저"를
 * 참조하게 되어 input.length !== digitCount 조건에 걸려 조기 종료된다.
 * act()를 분리하면 중간에 리렌더링이 일어나 최신 input을 반영한 onSubmit이 호출된다.
 */
function enterAndSubmit(
    result: RenderHookResult<ReturnType<typeof useNumberBaseball>, unknown>['result'],
    digits: number[]
) {
    act(() => {
        digits.forEach((d) => result.current.onDigit(d));
    });
    act(() => {
        result.current.onSubmit();
    });
}

describe('useNumberBaseball', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(makeSecret).mockReturnValue([1, 2, 3, 4]);
    });

    it('초기 상태: playing, 빈 input, 빈 history', () => {
        const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

        expect(result.current.status).toBe('playing');
        expect(result.current.input).toEqual([]);
        expect(result.current.history).toEqual([]);
        expect(result.current.gameOver).toBe(false);
    });

    describe('onDigit', () => {
        it('숫자를 입력하면 input에 추가된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => result.current.onDigit(1));
            act(() => result.current.onDigit(5));

            expect(result.current.input).toEqual([1, 5]);
        });

        it('digitCount만큼 채워지면 더 이상 추가되지 않는다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
                result.current.onDigit(3);
                result.current.onDigit(4);
                result.current.onDigit(5); // 5번째, 무시되어야 함
            });

            expect(result.current.input).toEqual([1, 2, 3, 4]);
        });

        it('이미 입력한 숫자는 중복으로 추가되지 않는다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(1); // 중복, 무시되어야 함
            });

            expect(result.current.input).toEqual([1]);
        });

        it('게임이 끝난 상태(gameOver)면 입력이 무시된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [1, 2, 3, 4]); // 정답 -> won

            expect(result.current.status).toBe('won');

            act(() => result.current.onDigit(9));

            expect(result.current.input).toEqual([]); // 여전히 빈 상태, 추가 안 됨
        });
    });

    describe('onDelete', () => {
        it('마지막 입력값을 제거한다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
                result.current.onDelete();
            });

            expect(result.current.input).toEqual([1]);
        });

        it('input이 비어있을 때 호출해도 에러 없이 빈 배열 유지', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => result.current.onDelete());

            expect(result.current.input).toEqual([]);
        });
    });

    describe('onSubmit', () => {
        it('digitCount와 길이가 다르면 제출되지 않는다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
            });
            act(() => {
                result.current.onSubmit(); // 2자리뿐이라 무시되어야 함
            });

            expect(result.current.history).toEqual([]);
        });

        it('정답과 일치하면 status가 won으로 바뀐다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [1, 2, 3, 4]);

            expect(result.current.status).toBe('won');
            expect(result.current.history).toHaveLength(1);
            expect(result.current.history[0]).toMatchObject({
                guess: [1, 2, 3, 4],
                strike: 4,
                ball: 0,
            });
        });

        it('제출 후 input이 초기화된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [5, 6, 7, 8]);

            expect(result.current.input).toEqual([]);
        });

        it('limited 모드에서 MAX_TRIES에 도달하고 오답이면 lost가 된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'limited'));
            const wrongGuesses = [
                [5, 6, 7, 8],
                [8, 7, 6, 5],
                [9, 5, 6, 7],
                [7, 9, 5, 6],
                [6, 7, 9, 5],
                [5, 9, 7, 6],
                [9, 6, 5, 7],
                [7, 5, 9, 6],
                [6, 9, 5, 7],
            ];

            // MAX_TRIES 값을 몰라도 되도록, lost 될 때까지만 반복 (최대 20회 안전장치)
            let guessIndex = 0;
            while (result.current.status === 'playing' && guessIndex < wrongGuesses.length) {
                enterAndSubmit(result, wrongGuesses[guessIndex]);
                guessIndex++;
            }

            expect(result.current.status).toBe('lost');
        });

        it('이미 시도한 조합은 다시 제출되지 않는다 (history 길이 불변)', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [5, 6, 7, 8]);
            expect(result.current.history).toHaveLength(1);

            // 같은 조합 재입력
            act(() => {
                result.current.onDigit(5);
                result.current.onDigit(6);
                result.current.onDigit(7);
                result.current.onDigit(8);
            });
            expect(result.current.isDuplicateGuess).toBe(true);
            expect(result.current.canSubmit).toBe(false);

            act(() => result.current.onSubmit());
            expect(result.current.history).toHaveLength(1); // 늘어나지 않아야 함
        });
    });

    describe('newGame / digitCount, mode 변경', () => {
        it('newGame 호출 시 input, history, status가 초기화된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [1, 2, 3, 4]);
            expect(result.current.status).toBe('won');

            act(() => result.current.newGame());

            expect(result.current.status).toBe('playing');
            expect(result.current.input).toEqual([]);
            expect(result.current.history).toEqual([]);
        });

        it('digitCount가 바뀌면 게임이 자동으로 리셋된다', () => {
            const { result, rerender } = renderHook(
                ({ digitCount, mode }: { digitCount: number; mode: GameMode }) =>
                    useNumberBaseball(digitCount, mode),
                { initialProps: { digitCount: 4, mode: 'unlimited' as GameMode } }
            );

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
            });
            expect(result.current.input).toEqual([1, 2]);

            rerender({ digitCount: 3, mode: 'unlimited' });

            expect(result.current.digitCount).toBe(3);
            expect(result.current.input).toEqual([]);
            expect(result.current.history).toEqual([]);
            expect(result.current.status).toBe('playing');
        });

        it('mode가 바뀌면 게임이 자동으로 리셋된다', () => {
            const { result, rerender } = renderHook(
                ({ digitCount, mode }: { digitCount: number; mode: GameMode }) =>
                    useNumberBaseball(digitCount, mode),
                { initialProps: { digitCount: 4, mode: 'unlimited' as GameMode } }
            );

            act(() => {
                result.current.onDigit(9);
            });
            expect(result.current.input).toEqual([9]);

            rerender({ digitCount: 4, mode: 'limited' });

            expect(result.current.mode).toBe('limited');
            expect(result.current.input).toEqual([]);
        });
    });

    describe('키보드 입력', () => {
        it('Backspace 키 입력 시 마지막 숫자가 삭제된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
            });

            act(() => {
                fireEvent.keyDown(window, { key: 'Backspace' });
            });

            expect(result.current.input).toEqual([1]);
        });

        it('Enter 키 입력 시 onSubmit이 호출된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                result.current.onDigit(1);
                result.current.onDigit(2);
                result.current.onDigit(3);
                result.current.onDigit(4);
            });

            act(() => {
                fireEvent.keyDown(window, { key: 'Enter' });
            });

            expect(result.current.status).toBe('won');
        });

        it('숫자 키(1~9) 입력이 input에 반영된다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            act(() => {
                fireEvent.keyDown(window, { key: '7' });
                fireEvent.keyDown(window, { key: '8' });
            });

            expect(result.current.input).toEqual([7, 8]);
        });
    });

    describe('hint 메시지', () => {
        it('아무것도 입력 안 했을 때 안내 메시지를 보여준다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));
            expect(result.current.hint).toContain('입력하세요');
        });

        it('승리 시 정답을 포함한 메시지를 보여준다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [1, 2, 3, 4]);

            expect(result.current.hint).toContain('홈런');
            expect(result.current.hint).toContain('1 2 3 4');
        });

        it('중복 제출 시도 시 경고 메시지를 보여준다', () => {
            const { result } = renderHook(() => useNumberBaseball(4, 'unlimited'));

            enterAndSubmit(result, [5, 6, 7, 8]);

            act(() => {
                result.current.onDigit(5);
                result.current.onDigit(6);
                result.current.onDigit(7);
                result.current.onDigit(8);
            });

            expect(result.current.hint).toContain('이미 시도한 조합');
        });
    });
});