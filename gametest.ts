import { describe, it, expect } from 'vitest';
import { judge, makeSecret, isWin, isOut} from "./src/lib/game";

describe('judge', () => {
    it('정답과 완전히 같으면 전부 스트라이크', () => {
        expect(judge([1, 2, 3, 4], [1, 2, 3, 4])).toEqual({ strike: 4, ball: 0 });
    });

    it('숫자는 있지만 자리가 다 틀리면 전부 볼', () => {
        // secret [1,2,3,4] 를 한 자리씩 밀어서 자리만 다르게
        // secret [1,2,3,4] 를 한 자리씩 밀어서 자리만 다르게
        expect(judge([4, 1, 2, 3], [1, 2, 3, 4])).toEqual({ strike: 0, ball: 4 });
    });

    it('일치하는 숫자가 하나도 없으면 아웃 (0 스트라이크 0 볼)', () => {
        expect(judge([5, 6, 7, 8], [1, 2, 3, 4])).toEqual({ strike: 0, ball: 0 });
    });

    it('스트라이크와 볼이 섞인 경우', () => {
        expect(judge([1, 3, 2, 9], [1, 2, 3, 4])).toEqual({ strike: 1, ball: 2 });
    });

    it('자릿수가 달라도 guess 길이 기준으로 순회한다', () => {
        expect(judge([1, 2], [1, 2, 3])).toEqual({ strike: 2, ball: 0 });
    });
});

describe('makeSecret', () => {
    it('요청한 자릿수만큼 숫자를 생성한다', () => {
        expect(makeSecret(3)).toHaveLength(3);
        expect(makeSecret(4)).toHaveLength(4);
        expect(makeSecret(5)).toHaveLength(5);
    });

    it('중복 숫자가 없다', () => {
        for (let i = 0; i < 50; i++) {
            const secret = makeSecret(5);
            expect(new Set(secret).size).toBe(secret.length);
        }
    });

    it('1~9 범위 안의 숫자만 생성한다', () => {
        const secret = makeSecret(5);
        secret.forEach((n) => {
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(9);
        });
    });
});

describe('isWin / isOut', () => {
    it('isWin: 스트라이크 수가 자릿수와 같으면 true', () => {
        expect(isWin({ strike: 4, ball: 0 }, 4)).toBe(true);
        expect(isWin({ strike: 3, ball: 1 }, 4)).toBe(false);
    });

    it('isOut: 스트라이크 볼 둘 다 0이면 true', () => {
        expect(isOut({ strike: 0, ball: 0 })).toBe(true);
        expect(isOut({ strike: 0, ball: 1 })).toBe(false);
        expect(isOut({ strike: 1, ball: 0 })).toBe(false);
    });
});