import { typeLetter, enter, backspace } from "@/store";

const letters: string[] = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm'
]

function Letter({ letter }: { letter: string }) {
  return (
    <div onClick={() => typeLetter(letter)}
      className="bg-[#636a6d] h-16 flex justify-center items-center w-8 rounded-sm active:bg-[#424749]">{letter}</div>
  )
}

function Enter() {
  return (
    <div onClick={enter}
      className="bg-[#636a6d] h-16 flex justify-center items-center w-12 rounded-sm active:bg-[#424749]"
    >
      Enter
    </div>
  )
}

function Backspace() {
  return (
    <div onClick={backspace}
      className="bg-[#636a6d] h-16 flex justify-center items-center w-12 rounded-sm active:bg-[#424749]"
    >
      {'<x'}
    </div>
  )
}

export function Keyboard() {
  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <div className="flex flex-row gap-1">
        {letters[0]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
      </div>
      <div className="flex flex-row gap-1">
        {letters[1]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
      </div>
      <div className="flex flex-row gap-1">
        <Enter />
        {letters[2]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
        <Backspace />
      </div>
    </div>
  )
}
