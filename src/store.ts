import { socket } from "./socket";
import { proxy } from "valtio";
import { devtools } from 'valtio/utils'
import type { } from '@redux-devtools/extension'
import { GameSnapshot, Language, PlayerSnapshot, WordLength } from "server/Game";


class ChessStore {
  error: string | null = null;
  roomId: string | null = null;
  userId: bigint | null = null;

  me: PlayerSnapshot | undefined = undefined;
  enemy: PlayerSnapshot | undefined = undefined;

  gameSnapshot: GameSnapshot | null = null;
  guess: string = '';
  errorAnimation: boolean = false;

  modals = {
    startNewGame: false,
  };
}

export const store = proxy(new ChessStore());

if (process.env.NODE_ENV === 'development') {
  devtools(store, {
    name: 'wordle store',
    serialize: {
      replacer: (_, value) => {
        if (typeof value === 'bigint') {
          return value.toString() + 'n'
        }
        return value
      }
    }
  })
}

export function typeLetter(letter: string) {
  //if store.guess.length === store.gameSnapshot.
  store.guess += letter
  console.log(letter)
  console.log(store.guess)
}

export function enter() {
  socket.emit(
    "command",
    {
      type: "submit_guess",
      payload: { guess: store.guess }
    },
    (result: boolean) => {
      if (result) {
        // Guess was accepted – clear the input
        store.guess = '';
      } else {
        // Invalid guess – trigger error animation
        store.errorAnimation = true;
      }
    }
  );
}


export function backspace() {
  store.guess = store.guess.slice(0, -1)
}

// 2) startNewGame without a callback
export function startNewGame(language: Language, wordLength: WordLength) {
  socket.emit("command", {
    type: "start_new_game",
    payload: { language, wordLength }
  });
}
