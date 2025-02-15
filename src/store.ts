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
