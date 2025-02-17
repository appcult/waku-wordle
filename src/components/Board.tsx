import { store } from "@/store";
import { cn } from "@udecode/cn";
import { LetterResult } from "server/Game";
import { useSnapshot } from "valtio";

function LetterBox({ character, result }: { character?: string, result?: LetterResult | '' }) {
  return (
    <div
      className={cn(
        "h-14 w-14 flex justify-center items-center",
        (!character || result === '') && "border-2 border-sf-wrong",
        result === "right" && "bg-sf-right",
        result === "misplaced" && "bg-sf-misplaced",
        result === "wrong" && "bg-sf-wrong"
      )}
    >
      {character?.toUpperCase()}
    </div>
  );
}

export function Board() {
  const { me, guess, gameSnapshot } = useSnapshot(store);
  if (!me) return null;

  // Fallback to defaults if gameSnapshot is null
  const wordLength = gameSnapshot?.wordLength ?? 5;
  const maxAttempts = gameSnapshot?.maxAttempts ?? 6;

  // The current guess row is simply the length of the letterGrid
  const guessRowIndex = me.letterGrid.length;

  return (
    <div className="flex flex-col space-y-1">
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex flex-row space-x-1">
          {Array.from({ length: wordLength }).map((_, colIndex) => {
            // If we're on the "current" row, display typed letters
            if (rowIndex === guessRowIndex && colIndex < guess.length) {
              return (
                <LetterBox
                  key={`guess-${rowIndex}-${colIndex}`}
                  character={guess[colIndex]}
                  result=""
                />
              );
            }
            // Otherwise, see if there's a letter from a submitted guess
            const letter = me.letterGrid[rowIndex]?.[colIndex];
            return letter && letter.character ? (
              <LetterBox
                key={`filled-${rowIndex}-${colIndex}`}
                character={letter.character}
                result={letter.result}
              />
            ) : (
              <LetterBox key={`empty-${rowIndex}-${colIndex}`} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

