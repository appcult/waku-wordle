import { store } from "@/store";
import { socket } from "@/socket"
import { Language, WordLength } from "server/Game";

export const startNewGame = (language: Language, wordLength: WordLength) => {
  socket.emit("command", {
    type: "start_new_game", payload: {
      language: language,
      wordLength: wordLength
    }
  });
  store.modals.startNewGame = false;
};



