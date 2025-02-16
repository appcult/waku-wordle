import { store } from "@/store";
import { cn } from "@udecode/cn";
import { Letter, LetterResult } from "server/Game";
import { useSnapshot } from "valtio";

function LetterBox({ character, result }: { character?: string | undefined, result?: LetterResult | '' }) {
  return (
    <div
      className={cn(
        "h-14 w-14 flex justify-center items-center",
        !character && "border-2 border-white",
        result === '' && 'border-2 border-white',
        result === "right" && "bg-[#4b7348]",
        result === "misplaced" && "bg-[#8e7f3b]",
        result === "wrong" && "bg-[#393c3e]"
      )}
    >
      {character}
    </div>
  );
}

function EmptyBox() {
  return <div className="h-14 w-14 border-2 border-white"></div>;
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

