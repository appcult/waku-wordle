export type LetterResult = 'right' | 'misplaced' | 'wrong';
export type ChatType = "sender" | "private" | "channel" | "group" | "supergroup";

export interface PlayerSnapshot {
  id: bigint;
  name: string | null;
  letterGrid: Letter[][];
  hasWon: boolean;
  online: boolean;
}

export interface GameSnapshot {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  spectators: bigint[];
  players: PlayerSnapshot[];
  maxAttempts: number;
  isGameOver: boolean;
  winner: bigint | null;
}
// Add new Letter type
export class Letter {
  character: string;
  result: LetterResult;

  constructor(character: string, result: LetterResult, row: number, column: number) {
    this.character = character;
    this.result = result;
  }
}
// Update Player class
export class Player {
  id: bigint;
  name: string | null;
  letterGrid: Letter[][]; // Replaces guesses and results
  hasWon: boolean;
  online: boolean;

  constructor(id: bigint) {
    this.id = id;
    this.name = null;
    this.letterGrid = [];
    this.hasWon = false;
    this.online = false;
  }
}

export class Game {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  createdAt: number;
  spectators: bigint[];
  players: Player[];
  targetWord: string;
  maxAttempts: number;
  isGameOver: boolean;
  winner: bigint | null;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.createdAt = Date.now();
    this.spectators = [];
    this.players = [];
    this.targetWord = this.selectRandomWord();
    this.maxAttempts = 6;
    this.isGameOver = false;
    this.winner = null;
  }

  private selectRandomWord(): string {
    // Implement your word selection logic from a predefined list
    return 'basic'; // Temporary placeholder
  }

  joinUser(userId: bigint): boolean {
    const existingPlayer = this.getPlayer(userId);
    if (existingPlayer) {
      existingPlayer.online = true;
      return true;
    }

    if (this.spectators.includes(userId)) return false;

    if (this.players.length < 2) {
      const newPlayer = new Player(userId);
      newPlayer.online = true;
      this.players.push(newPlayer);
      return true;
    }

    this.spectators.push(userId);
    return true;
  }

  disconnectUser(userId: bigint) {
    const player = this.getPlayer(userId);
    if (player) {
      player.online = false;
    } else {
      this.spectators = this.spectators.filter(id => id !== userId);
    }
  }

  setName(userId: bigint, name: string): void {
    const player = this.getPlayer(userId);
    if (player) {
      player.name = name;
    }
  }
  // Add to Game class:

  public startNewGame(): void {
    this.targetWord = this.selectRandomWord();
    this.isGameOver = false;
    this.winner = null;
    this.createdAt = Date.now();

    // Reset player states while keeping them in the game
    for (const player of this.players) {
      player.letterGrid = [];
      player.hasWon = false;
    }

    // Keep spectators but let them join as players in new game if slots open
    this.spectators = [];
  }

  // Modified submitGuess method to handle simultaneous play:
  submitGuess(userId: bigint, guess: string): boolean {
    if (this.isGameOver) return false;

    const player = this.getPlayer(userId);
    if (!player || player.hasWon || player.letterGrid.length >= this.maxAttempts) return false;

    if (!this.validateGuess(guess)) return false;

    const result = this.calculateResult(guess);
    const row = player.letterGrid.length;
    const guessLetters = guess.split('').map((char, column) =>
      new Letter(char, result[column], row, column)
    );

    player.letterGrid.push(guessLetters);

    if (guess === this.targetWord) {
      player.hasWon = true;
      if (!this.isGameOver) {
        this.isGameOver = true;
        this.winner = player.id;
      }
    } else if (player.letterGrid.length === this.maxAttempts) {
      this.checkGameOver();
    }

    if (!this.isGameOver) this.checkGameOver();
    return true;
  }

  // Modified checkGameOver to handle tiebreaker:
  private checkGameOver() {
    // Immediate win check
    const winners = this.players.filter(p => p.hasWon);
    if (winners.length > 0) {
      this.isGameOver = true;
      this.winner = winners[0].id; // First winner to submit
      return;
    }

    // All players exhausted attempts
    if (this.players.every(p => p.letterGrid.length >= this.maxAttempts)) {
      this.isGameOver = true;
      // Tiebreaker: Player with most correct letters
      const playerScores = this.players.map(p => ({
        id: p.id,
        score: p.letterGrid.flat().filter(letter => letter.result === 'right').length
      }));

      const maxScore = Math.max(...playerScores.map(p => p.score));
      const topPlayers = playerScores.filter(p => p.score === maxScore);

      this.winner = topPlayers.length === 1 ? topPlayers[0].id : null;
    }
  }

  private validateGuess(guess: string): boolean {
    return guess.length === 5 && /* Add dictionary check */ true;
  }

  private calculateResult(guess: string): LetterResult[] {
    const result: LetterResult[] = [];
    const targetLetters = this.targetWord.split('');
    const guessLetters = guess.split('');

    // First pass for correct letters
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'right';
        targetLetters[i] = ''; // Prevent reuse
      }
    }

    // Second pass for present letters
    for (let i = 0; i < guessLetters.length; i++) {
      if (result[i]) continue;
      const foundIndex = targetLetters.indexOf(guessLetters[i]);
      if (foundIndex !== -1) {
        result[i] = 'misplaced';
        targetLetters[foundIndex] = '';
      } else {
        result[i] = 'wrong';
      }
    }

    return result;
  }

  getSnapshot(): GameSnapshot {
    return {
      roomId: this.roomId,
      chatId: this.chatId,
      chatType: this.chatType,
      spectators: [...this.spectators],
      players: this.players.map(player => this.getPlayerSnapshot(player)),
      maxAttempts: this.maxAttempts,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  private getPlayerSnapshot(player: Player): PlayerSnapshot {
    return {
      id: player.id,
      name: player.name,
      letterGrid: player.letterGrid.map(row => [...row]),
      hasWon: player.hasWon,
      online: player.online
    };
  }

  private getPlayer(userId: bigint): Player | null {
    return this.players.find(player => player.id === userId) || null;
  }
}
