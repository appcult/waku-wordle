import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { cn } from "@udecode/cn";
import { LetterResult } from "server/Game";

export function Board() {
  const { me, guess, gameSnapshot, errorAnimation } = useSnapshot(store);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  // When errorAnimation is true, apply a temporary style change to blink the active row
  useEffect(() => {
    if (errorAnimation && activeRowRef.current) {
      const letterBoxes = activeRowRef.current.querySelectorAll("div");
      letterBoxes.forEach((box) => {
        // Save original border color
        const original = window.getComputedStyle(box).borderColor;
        // Apply immediate change
        box.style.transition = "border-color 0.15s ease-in-out";
        box.style.borderColor = "red";
        // Revert after 150ms
        setTimeout(() => {
          box.style.borderColor = original;
        }, 150);
      });
      // Reset errorAnimation after the blink (300ms total)
      const timer = setTimeout(() => {
        store.errorAnimation = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [errorAnimation]);

  if (!me) return null;

  const wordLength = gameSnapshot?.wordLength ?? 5;
  const maxAttempts = gameSnapshot?.maxAttempts ?? 6;
  const guessRowIndex = me.letterGrid.length;

  return (
    <div className="flex flex-col space-y-1">
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex flex-row space-x-1"
          ref={rowIndex === guessRowIndex ? activeRowRef : null}
        >
          {Array.from({ length: wordLength }).map((_, colIndex) => {
            // For the active guess row, display typed letters
            if (rowIndex === guessRowIndex && colIndex < guess.length) {
              return (
                <div
                  key={`guess-${rowIndex}-${colIndex}`}
                  className="h-14 w-14 flex justify-center items-center border-2 border-sf-wrong transition-colors"
                >
                  {guess[colIndex].toUpperCase()}
                </div>
              );
            }
            // Otherwise, display a letter from a submitted guess
            const letter = me.letterGrid[rowIndex]?.[colIndex];
            if (letter && letter.character) {
              return (
                <div
                  key={`filled-${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-14 w-14 flex justify-center items-center transition-colors",
                    letter.result === "right" && "bg-sf-right",
                    letter.result === "misplaced" && "bg-sf-misplaced",
                    letter.result === "wrong" && "bg-sf-wrong"
                  )}
                >
                  {letter.character.toUpperCase()}
                </div>
              );
            }
            // Empty letter box
            return (
              <div
                key={`empty-${rowIndex}-${colIndex}`}
                className="h-14 w-14 flex justify-center items-center border-2 border-sf-wrong"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

