import { Server as SocketIOServer } from "socket.io";
import * as SocketIOParser from '@kim5257/socket.io-parser-bigint';
import { GameSnapshot } from "./Game";
import { GamesManager } from "./GamesManager";

// Define al possible command types and their payloads
type Command =
  | { type: "start_new_game" }
  | { type: "submit_guess"; payload: { guess: string } }

// Update ClientToServerEvents to use single command event
export interface ClientToServerEvents {
  "join game": (roomId: string, userId: bigint) => void;
  "command": (command: Command) => void;
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
  socket.on("command", async (command) => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;

    switch (command.type) {
      case "start_new_game":
        game.startNewGame();
        break;
      case "submit_guess":
        game.submitGuess(userId, command.payload.guess);
        break;
      default:
        console.warn("Unknown command type:", command);
        return;
    }

    // update game
    // update game players
    //if (command.type === "start_new_game") {
    //  createNewGame(client, roomId, game)
    //} else {
    //  updateGame(client, game)
    //}

    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
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
