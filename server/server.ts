import { Server as SocketIOServer } from "socket.io";
import * as SocketIOParser from '@kim5257/socket.io-parser-bigint';
import { GameSnapshot, Language, WordLength } from "./Game";
import { GamesManager } from "./GamesManager";

// Define al possible command types and their payloads
type Command =
  | {
    type: "start_new_game";
    payload: { language?: Language, wordLength?: WordLength }
  }
  | {
    type: "submit_guess";
    payload: { guess: string }
  }

// Update ClientToServerEvents to use single command event
export interface ClientToServerEvents {
  "join game": (roomId: string, userId: bigint) => void;
  "command": (command: Command, callback?: (result: boolean) => void) => void;
}


export interface ServerToClientEvents {
  gameSnapshot: (gameSnapshot: GameSnapshot) => void;
  ping: () => void;
}

export interface SocketData {
  roomId: string;
  userId: bigint;
}

const io = new SocketIOServer<
  ClientToServerEvents, ServerToClientEvents, SocketData
>({
  cors: { origin: "*" },
  parser: SocketIOParser,
});

const gamesManager = new GamesManager();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Join game handler remains the same
  socket.on("join game", async (roomId, userId) => {
    socket.data = { roomId, userId };
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;

    game.joinUser(userId);
    //initDatabase(client, roomId, userId, game)

    socket.join(roomId);
    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
  });

  // Single command handler for all game actions
  socket.on("command", async (command, callback) => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) {
      if (callback) callback(false);
      return;
    }

    let result = true;
    switch (command.type) {
      case "start_new_game":
        await game.startNewGame(command.payload.language, command.payload.wordLength);
        break;
      case "submit_guess":
        result = game.submitGuess(userId, command.payload.guess);
        break;
      default:
        console.warn("Unknown command type:", command);
        if (callback) callback(false);
        return;
    }

    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
    if (command.type === "submit_guess" && callback) {
      callback(result);
    }
  });


  socket.on("disconnect", () => {
    console.log("User disconnected");
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;
    game.disconnectUser(userId);
    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
  });
});

const port = Number(process.env.SOCKETS_PORT || "3000");
io.listen(port);
console.log(`Server running at http://localhost:${port}`);
