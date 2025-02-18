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
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId') || '1';
    const userIdParam = searchParams.get('userId');
    const userId = userIdParam ? BigInt(userIdParam) : BigInt(1);

    store.roomId = roomId;
    store.userId = userId;

    socket.emit("join game", roomId, userId);

    socket.on("gameSnapshot", (gameSnapshot: GameSnapshot) => {
      const previousCreatedAt = store.gameSnapshot?.createdAt;
      if (previousCreatedAt !== gameSnapshot.createdAt) {
        store.guess = '';
      }
      store.gameSnapshot = gameSnapshot;
      store.me = gameSnapshot.players.find(player => player.id === userId);
      store.enemy = gameSnapshot.players.find(player => player.id !== userId);
      store.modals.startNewGame = gameSnapshot.isGameOver;
    });

    return () => {
      socket.off("gameSnapshot");
    };
  }, []);

  const { modals } = useSnapshot(store);

  return (
    <>
      <div className="h-screen flex flex-col text-white bg-[#121213] justify-between py-2">
        <div className="flex justify-center">
          <Board />
        </div>
        <Keyboard />
      </div>
      {modals.startNewGame && <StartNewGameModal />}
    </>
  );
}

