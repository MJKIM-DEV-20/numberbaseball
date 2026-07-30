import { useState } from 'react';
import { DifficultySelector } from './components/DifficultySelector';
import { Keypad } from './components/Keypad';
import { Screen } from './components/Screen';
import { useNumberBaseball } from './hooks/useNumberBaseball';
import './App.css';

export default function App() {
  const [digitCount, setDigitCount] = useState(4);
  const game = useNumberBaseball(digitCount);

  return (
    <div className="phone">
      <div className="earpiece" />
      <Screen
        digitCount={digitCount}
        input={game.input}
        gameOver={game.gameOver}
        hint={game.hint}
        history={game.history}
      />
      <DifficultySelector digitCount={digitCount} onChange={setDigitCount} />
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
      <div className="footer-note">1~9 · 키보드로도 입력 가능 (Enter/Backspace)</div>
    </div>
  );
}
