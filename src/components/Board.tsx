import { store } from "@/store";
import { cn } from "@udecode/cn";
import { LetterResult } from "server/Game";
import { useSnapshot } from "valtio";

function LetterBox({ character, result }: { character?: string | undefined, result?: LetterResult | '' }) {
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
  const { me, guess } = useSnapshot(store);
  if (!me) return null;

  const maxLetters = 5;
  const currentRow = me.letterGrid.findIndex(row => row.every(letter => !letter.character));
  const lastRowIndex = currentRow !== -1 ? currentRow : me.letterGrid.length;

  return (
    <div className="flex flex-col space-y-1">
      {[...Array(6)].map((_, row) => (
        <div key={`empty-${row}`} className="flex flex-row space-x-1">
          {[...Array(5)].map((_, column) => {
            if (row === lastRowIndex && column < guess.length) {
              return <LetterBox key={`guess-${row}-${column}`}
                character={guess[column]} result={""}
              />;
            }
            const letter = me.letterGrid[row]?.[column];
            return letter && letter.character !== "" ? (
              <LetterBox key={`filled-${row}-${column}`}
                character={letter.character}
                result={letter.result} />
            ) : (
              <LetterBox key={`filled-${row}-${column}`} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

