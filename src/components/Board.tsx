const letters: string[] = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm'
]

export function Letter({ letter }: { letter: string }) {
  return (
    <div className="bg-[#636a6d] h-16 flex justify-center items-center w-8 rounded-sm active:bg-[#424749]">{letter}</div>
  )
}

export function Board() {
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
        {letters[2]!.split('').map((letter) => (
          <Letter letter={letter} />
        ))}
      </div>
    </div>
  )
}
