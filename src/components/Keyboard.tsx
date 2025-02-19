import { typeLetter, enter, backspace, store } from "@/store";
import { cn } from "@udecode/cn";
import { useSnapshot } from "valtio";
import { FaDeleteLeft } from "react-icons/fa6";

// 1. Restrict keys to only 'en', 'ru', 'uk'
type Language = "en" | "ru" | "uk";

const keyboardLayouts: Record<Language, string[]> = {
  en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  ru: ["йцукенгшщзхъ", "фывапролджэ", "ячсмитьбю"],
  uk: ["йцукенгшщзхї", "фівапролджє", "ячсмитьбю"],
};

function getBestLetterResult(letter: string): "right" | "misplaced" | "wrong" | undefined {
  const letterStates = store.me?.letterGrid.flat().flat();
  if (!letterStates) return undefined;

  // Iterate over each letter and check the results in order of priority.
  for (const l of letterStates) {
    if (l.character === letter && l.result === "right") {
      return "right"; // highest priority: return immediately if found
    }
  }

  let best: "misplaced" | "wrong" | undefined = undefined;
  for (const l of letterStates) {
    if (l.character === letter) {
      if (l.result === "misplaced") {
        best = "misplaced";
      } else if (!best && l.result === "wrong") {
        best = "wrong";
      }
    }
  }

  return best;
}

function Letter({ letter }: { letter: string }) {
  const { me } = useSnapshot(store);
  const result = getBestLetterResult(letter);

  return (
    <div
      onClick={() => typeLetter(letter)}
      className={cn(
        "bg-sf h-12 flex justify-center items-center flex-1 rounded-md active:bg-sf-active select-none cursor-pointer",
        result === "right" && "bg-sf-right active:bg-sf-right-active",
        result === "misplaced" && "bg-sf-misplaced active:bg-sf-misplaced-active",
        result === "wrong" && "bg-sf-wrong active:bg-sf-wrong-active"
      )}
    >
      {letter.toUpperCase()}
    </div>
  );
}


function Enter({ language }: { language: Language }) {
  const { gameSnapshot } = useSnapshot(store);
  // Define labels for both states: during game and game over
  const labels: Record<Language, { submit: string; startNew: string }> = {
    en: { submit: "SUBMIT", startNew: "START NEW GAME" },
    ru: { submit: "ПРОВЕРИТЬ", startNew: "НАЧАТЬ НОВУЮ ИГРУ" },
    uk: { submit: "ПЕРЕВІРИТИ", startNew: "РОЗПОЧАТИ НОВУ ГРУ" },
  };

  // Change this condition as needed to detect game over state
  const isGameOver = gameSnapshot?.isGameOver;

  return (
    <div
      onClick={() => {
        if (isGameOver) {
          // Instead of submitting a guess, toggle the start new game modal
          store.modals.startNewGame = true;
        } else {
          enter();
        }
      }}
      className="bg-sf h-12 flex justify-center items-center w-full rounded-md active:bg-sf-active select-none cursor-pointer text-lg font-bold"
    >
      {isGameOver ? labels[language].startNew : labels[language].submit}
    </div>
  );
}


function Backspace() {
  return (
    <div
      onClick={backspace}
      className="bg-sf h-12 flex justify-center items-center rounded-md active:bg-sf-active select-none cursor-pointer"
    >
      <FaDeleteLeft size={24} />
    </div>
  );
}

export function Keyboard() {
  const { gameSnapshot } = useSnapshot(store);

  // 2. Safely determine current language
  let currentLanguage: Language = "en";
  if (["ru", "uk", "en"].includes(gameSnapshot?.language)) {
    currentLanguage = gameSnapshot.language;
  }

  // 3. layout is guaranteed to be string[]
  const layout = keyboardLayouts[currentLanguage];

  return (
    <div className="flex flex-col justify-center items-center gap-1 w-full px-2">
      {layout.map((row, rowIndex) => {
        // For the first 2 rows, keep it as flex
        if (rowIndex < 2) {
          return (
            <div key={`row-${rowIndex}`} className="flex flex-row gap-1 w-full">
              {row.split("").map((letter) => (
                <Letter letter={letter} key={letter} />
              ))}
            </div>
          );
        }

        // For the 3rd row, use a grid so Backspace spans 2 columns + gap
        return (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-1 w-full"
            // We create row.length + 2 columns, so the last item can span 2 columns
            style={{ gridTemplateColumns: `repeat(${row.length + 2}, 1fr)` }}
          >
            {row.split("").map((letter) => (
              <div key={letter}>
                <Letter letter={letter} />
              </div>
            ))}
            {/* Place Backspace in the last 2 columns */}
            <div className="col-span-2">
              <Backspace />
            </div>
          </div>
        );
      })}
      {/* Enter button across full width below all rows */}
      <Enter language={currentLanguage} />
    </div>
  );
}

