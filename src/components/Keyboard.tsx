import { typeLetter, enter, backspace, store } from "@/store";
import { cn } from "@udecode/cn";
import { useSnapshot } from "valtio";

const keyboardLetters: string[] = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm'
]

function Letter({ letter }: { letter: string }) {
  const { me } = useSnapshot(store)
  const letters = me?.letterGrid.flat().flat()
  const result = letters?.find(l => l.character === letter)?.result
  return (
    <div onClick={() => typeLetter(letter)}
      className={cn(
        "bg-sf h-16 flex justify-center items-center w-8 rounded-sm active:bg-sf-active",
        result === 'right' && '!bg-sf-right',
        result === 'misplaced' && '!bg-sf-misplaced',
        result === 'wrong' && '!bg-sf-wrong',
      )}>
      {letter.toUpperCase()}
    </div>
  )
}

function Enter() {
  return (
    <div onClick={enter}
      className="bg-sf h-16 flex justify-center items-center w-12 rounded-sm active:bg-sf-active"
    >
      Enter
    </div>
  )
}

function Backspace() {
  return (
    <div onClick={backspace}
      className="bg-sf h-16 flex justify-center items-center w-12 rounded-sm active:bg-sf-active"
    >
      {'<x'}
    </div>
  )
}

export function Keyboard() {
  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <div className="flex flex-row gap-1">
        {keyboardLetters[0]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
      </div>
      <div className="flex flex-row gap-1">
        {keyboardLetters[1]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
      </div>
      <div className="flex flex-row gap-1">
        <Enter />
        {keyboardLetters[2]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
        <Backspace />
      </div>
    </div>
  )
}
