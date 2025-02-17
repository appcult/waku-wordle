"use client"

import { store } from "@/store";
import { socket } from "../socket";
import { useEffect } from 'react';
import { GameSnapshot } from "server/Game";
import { useSnapshot } from "valtio";
import StartNewGameModal from "./modals/StartNewGameModal";
import { Keyboard } from "./Keyboard";
import { Board } from "./Board";

export function Screen() {
  useEffect(() => {
    // Get search parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId') || '1';
    const userIdParam = searchParams.get('userId');

    // Parse userId as BigInt or default to 1n
    const userId = userIdParam ? BigInt(userIdParam) : BigInt(1);

    store.roomId = roomId;
    store.userId = userId;

    socket.emit("join game", roomId, userId);

    socket.on("ping", () => {
      console.log("ping")
    })

    socket.on("gameSnapshot", (gameSnapshot: GameSnapshot) => {
      console.log("received gameSnapshot");
      store.gameSnapshot = gameSnapshot;
      store.me = gameSnapshot.players.find(player => player.id === userId);
      store.enemy = gameSnapshot.players.find(player => player.id !== userId);
      if (store.gameSnapshot.isGameOver === true) {
        store.modals.startNewGame = true
      } else {
        store.modals.startNewGame = false
      }
    });

  }, []);

  const { modals } = useSnapshot(store)

  return (
    <>
      <div className="h-screen flex flex-col text-white bg-[#121213] justify-between py-2">
        <div className="flex justify-center">
          <Board />
        </div>
        <Keyboard />
      </div >
      {modals.startNewGame && <StartNewGameModal />}
    </>
  );
}
