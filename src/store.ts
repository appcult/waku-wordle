import { socket } from "./socket";
import { proxy } from "valtio";
import { devtools } from 'valtio/utils'
import type { } from '@redux-devtools/extension'
import { GameSnapshot, PlayerSnapshot } from "server/Game";


class ChessStore {
  error: string | null = null;
  roomId: string | null = null;
  userId: bigint | null = null;

  me: PlayerSnapshot | undefined = undefined;
  enemy: PlayerSnapshot | undefined = undefined;

  gameSnapshot: GameSnapshot | null = null;
  guess: string = '';

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
}

export function enter() {
  store.guess = '';
  socket.emit("command", {
    type: "submit_guess", payload: { guess: 'house' }
  })
}

export function backspace() {
  store.guess = store.guess.slice(0, -1)
}
