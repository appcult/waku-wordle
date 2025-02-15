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
    });

  }, []);

  const { me, enemy, modals, gameSnapshot } = useSnapshot(store)

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#161511]" />
      <div className="h-screen flex text-white bg-[#161511]">
        <div className="w-full flex flex-col">
          <div className="flex justify-center">
            <Board />

          </div>
          <Keyboard />
        </div>
      </div >
      {modals.startNewGame && <StartNewGameModal />}
    </>
  );
}
