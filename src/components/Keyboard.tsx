import React from "react";
import { typeLetter, enter, backspace, store } from "@/store";
import { cn } from "@udecode/cn";
import { useSnapshot } from "valtio";

// 1. Restrict keys to only 'en', 'ru', 'uk'
type Language = "en" | "ru" | "uk";

const keyboardLayouts: Record<Language, string[]> = {
  en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  ru: ["йцукенгшщзхъ", "фывапролджэ", "ячсмитьбю"],
  uk: ["йцукенгшщзхї", "фівапролджє", "ячсмитьбю"],
};

function Letter({ letter }: { letter: string }) {
  const { me } = useSnapshot(store);
  const letters = me?.letterGrid.flat().flat();
  const result = letters?.find((l) => l.character === letter)?.result;

  return (
    <div
      onClick={() => typeLetter(letter)}
      className={cn(
        "bg-sf h-16 flex justify-center items-center w-8 rounded-sm active:bg-sf-active select-none cursor-pointer",
        result === "right" && "!bg-sf-right",
        result === "misplaced" && "!bg-sf-misplaced",
        result === "wrong" && "!bg-sf-wrong"
      )}
    >
      {letter.toUpperCase()}
    </div>
  );
}

function Enter() {
  return (
    <div
      onClick={enter}
      className="bg-sf h-16 flex justify-center items-center w-12 rounded-sm active:bg-sf-active select-none cursor-pointer"
    >
      Enter
    </div>
  );
}

function Backspace() {
  return (
    <div
      onClick={backspace}
      className="bg-sf h-16 flex justify-center items-center w-12 rounded-sm active:bg-sf-active select-none cursor-pointer"
    >
      {"<x"}
    </div>
  );
}

export function Keyboard() {
  const { gameSnapshot } = useSnapshot(store);

  // 2. Safely determine current language
  //    If gameSnapshot.language is not one of 'en', 'ru', or 'uk',
  //    default to 'en'.
  let currentLanguage: Language = "en";
  if (
    gameSnapshot?.language === "ru" ||
    gameSnapshot?.language === "uk" ||
    gameSnapshot?.language === "en"
  ) {
    currentLanguage = gameSnapshot.language;
  }

  // 3. layout is guaranteed to be string[]
  const layout = keyboardLayouts[currentLanguage];

  return (
    <div className="flex flex-col justify-center items-center gap-1">
      {layout.map((row, rowIndex) => {
        // For the last row, include Enter and Backspace
        if (rowIndex === 2) {
          return (
            <div key={`row-${rowIndex}`} className="flex flex-row gap-1">
              <Enter />
              {row.split("").map((letter) => (
                <Letter letter={letter} key={letter} />
              ))}
              <Backspace />
            </div>
          );
        }

        // For the first two rows, just show the letters
        return (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-1">
            {row.split("").map((letter) => (
              <Letter letter={letter} key={letter} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

