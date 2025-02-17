"use client"
import { store } from '@/store';
import { Modal } from './Modal';
import { useSnapshot } from 'valtio';
import { startNewGame } from '@/storeFunctions/socketFunctions';

export default function StartNewGameModal() {
  const { me } = useSnapshot(store)
  const gameOverMessage = me?.hasWon ? 'You won!' : 'You lost!'

  return (
    <Modal
      isOpen={store.modals.startNewGame}
      onClose={() => store.modals.startNewGame = false}
    >
      <div className='mb-6 flex justify-center text-xl'>
        {gameOverMessage}
      </div>

      {/* Start Button */}
      <button
        onClick={startNewGame}
        className="w-full bg-online text-white py-3 rounded-lg font-semibold"
      >
        Start New Game
      </button>
    </Modal>
  );
}
