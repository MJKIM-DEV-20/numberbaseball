import { useState } from 'react';
import { DifficultySelector } from './components/DifficultySelector';
import { ModeSelector } from './components/ModeSelector';
import { Keypad } from './components/Keypad';
import { Screen } from './components/Screen';
import { ResultPanel } from './components/ResultPanel';
import { useNumberBaseball } from './hooks/useNumberBaseball';
import type { GameMode } from './lib/game';
import './App.css';

export default function App() {
  const [digitCount, setDigitCount] = useState(4);
  const [mode, setMode] = useState<GameMode>('limited');
  const game = useNumberBaseball(digitCount, mode);

  return (
    <div className="stadium-bg">
      <div className="tower left" />
      <div className="tower right" />
      <div className="horizon" />

      <div className="board">
        <div className="marquee">⚾ 숫자야구</div>

        <div className="options">
          <ModeSelector mode={mode} onChange={setMode} />
          <DifficultySelector digitCount={digitCount} onChange={setDigitCount} />
        </div>

        <Screen
          digitCount={digitCount}
          mode={mode}
          input={game.input}
          gameOver={game.gameOver}
          hint={game.hint}
          history={game.history}
          triesLeft={game.triesLeft}
        />

        {game.status === 'playing' ? (
          <Keypad
            digitCount={digitCount}
            input={game.input}
            gameOver={game.gameOver}
            canSubmit={game.canSubmit}
            onDigit={game.onDigit}
            onDelete={game.onDelete}
            onSubmit={game.onSubmit}
            onReset={game.newGame}
          />
        ) : (
          <ResultPanel
            status={game.status}
            secret={game.secret}
            tries={game.history.length}
            onRestart={game.newGame}
          />
        )}

        <div className="footer-note">1~9 키보드로도 입력 가능 (Enter/Backspace)</div>
      </div>
    </div>
  );
}
