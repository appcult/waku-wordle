"use client"
import React, { useState } from 'react';
import { store } from '@/store';
import { Modal } from './Modal';
import { useSnapshot } from 'valtio';
import { startNewGame } from '@/socketFunctions';
import { cn } from "@udecode/cn";

type Language = 'en' | 'ru' | 'uk';

export default function StartNewGameModal() {
  const { me } = useSnapshot(store);
  const gameOverMessage = me?.hasWon ? 'You won!' : 'You lost!';

  // Local state for game options
  const [gameOptions, setGameOptions] = useState<{
    language: Language;
    wordLength: number;
  }>({
    language: 'en',
    wordLength: 5,
  });

  // Language and letter-pill definitions
  const languages: Array<{ label: string; value: Language }> = [
    { label: 'en', value: 'en' },
    { label: 'ru', value: 'ru' },
    { label: 'uk', value: 'uk' },
  ];

  const letterOptions = [4, 5, 6];

  // Start game handler
  const handleStartNewGame = () => {
    startNewGame(gameOptions.language, gameOptions.wordLength);
    store.modals.startNewGame = false;
  };

  return (
    <Modal
      isOpen={store.modals.startNewGame}
      onClose={() => (store.modals.startNewGame = false)}
    >
      <div className="mb-6 flex justify-center text-xl">
        {gameOverMessage}
      </div>

      {/* Language Selection Pills */}
      <div className="mb-6">
        <label className="block text-text mb-2">Game Language</label>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setGameOptions({ ...gameOptions, language: lang.value })}
              className={cn(
                "p-2 rounded text-center transition-colors",
                gameOptions.language === lang.value
                  ? "bg-text-dark text-white"   // selected style
                  : "bg-timer text-text hover:opacity-90" // unselected style
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Count Selection Pills */}
      <div className="mb-6">
        <label className="block text-text mb-2">Number of Letters</label>
        <div className="grid grid-cols-3 gap-2">
          {letterOptions.map((length) => (
            <button
              key={length}
              onClick={() => setGameOptions({ ...gameOptions, wordLength: length })}
              className={cn(
                "p-2 rounded text-center transition-colors",
                gameOptions.wordLength === length
                  ? "bg-text-dark text-white"
                  : "bg-timer text-text hover:opacity-90"
              )}
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartNewGame}
        className="w-full bg-online text-white py-3 rounded-lg font-semibold"
      >
        Start New Game
      </button>
    </Modal>
  );
}

