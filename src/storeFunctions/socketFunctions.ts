import { store } from "@/store";
import { socket } from "@/socket"

export const startNewGame = () => {
  socket.emit("command", { type: "start_new_game" });
  store.modals.startNewGame = false;
};



