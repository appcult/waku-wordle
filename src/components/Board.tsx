import { store } from "@/store";
import { useSnapshot } from "valtio";

export function Board() {
  const snap = useSnapshot(store)
  return (
    <div className="flex flex-col">
      {snap.me && snap.me.guesses.map((guess) => (
        <div>{guess}</div>
      ))}
      {snap.guess}
    </div>
  )
}
