import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type LetterResult = 'right' | 'misplaced' | 'wrong';
export type ChatType = "sender" | "private" | "channel" | "group" | "supergroup";

export type Language = 'en' | 'ru' | 'uk';
export type WordLength = 4 | 5 | 6;

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
  wordLength: number;
  maxAttempts: number;
  isGameOver: boolean;
  winner: bigint | null;
  language: Language;
}

export class Letter {
  character: string;
  result: LetterResult;

  constructor(character: string, result: LetterResult) {
    this.character = character;
    this.result = result;
  }
}

export class Player {
  id: bigint;
  name: string | null;
  letterGrid: Letter[][];
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

// Use fileURLToPath + import.meta.url to emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  language: Language;
  wordLength: WordLength;
  private dictionary: Set<string>;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.createdAt = Date.now();
    this.spectators = [];
    this.players = [];
    this.language = 'en';
    this.wordLength = 5;
    this.dictionary = new Set();
    this.targetWord = '';
    this.maxAttempts = 6;
    this.isGameOver = false;
    this.winner = null;

    // Start a new game on creation
    // (ignore the Promise if you don’t need to await it)
    this.startNewGame().catch(console.error);
  }

  /**
   * Reads the dictionary file from disk using fs,
   * based on the current language and wordLength.
   */
  private async loadDictionary(): Promise<void> {
    try {
      // Build the path to your .txt file
      const fileName = `${this.language}_${this.wordLength}.txt`;
      const filePath = path.join(__dirname, 'dicts', fileName);

      // Read file contents (asynchronously)
      const dictText = await fs.readFile(filePath, 'utf-8');

      this.dictionary = new Set(
        dictText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length === this.wordLength)
      );
    } catch (error) {
      console.error('Error loading dictionary:', error);
      this.dictionary = new Set();
    }
  }

  public async startNewGame(language?: Language, wordLength?: WordLength): Promise<void> {
    this.language = language ?? 'en';
    this.wordLength = wordLength ?? 5;

    // Load the dictionary for the chosen language & word length
    await this.loadDictionary();

    // Randomly pick a target word from the dictionary
    const wordsArray = Array.from(this.dictionary);
    this.targetWord = wordsArray[Math.floor(Math.random() * wordsArray.length)] || '';
    console.log(this.targetWord)

    this.isGameOver = false;
    this.winner = null;
    this.createdAt = Date.now();

    // Reset players
    this.players = this.players.map(player => {
      player.letterGrid = [];
      player.hasWon = false;
      return player;
    });

    // Clear spectators (optional)
    this.spectators = [];
  }

  joinUser(userId: bigint): boolean {
    const existingPlayer = this.getPlayer(userId);
    if (existingPlayer) {
      existingPlayer.online = true;
      return true;
    }

    if (this.spectators.includes(userId)) return false;

    // Limit to 2 players for this example
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

  submitGuess(userId: bigint, guess: string): boolean {
    if (this.isGameOver) return false;

    const player = this.getPlayer(userId);
    if (!player || player.hasWon || player.letterGrid.length >= this.maxAttempts) return false;

    // Check if guess is valid in dictionary
    if (!this.validateGuess(guess)) return false;

    // Compare guess with target
    const result = this.calculateResult(guess);

    // Build a new row of Letters
    const row = player.letterGrid.length;
    const guessLetters = guess.split('').map((char, column) => {
      return new Letter(char, result[column]);
      // If you need row/column:
      // return new Letter(char, result[column], row, column);
    });

    // Push the row into the player's grid
    player.letterGrid.push(guessLetters);

    // Check for win or end of attempts
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

  private checkGameOver() {
    const winners = this.players.filter(p => p.hasWon);
    if (winners.length > 0) {
      this.isGameOver = true;
      return;
    }

    // If all players used up attempts, determine winner by "score"
    if (this.players.every(p => p.letterGrid.length >= this.maxAttempts)) {
      this.isGameOver = true;
      const playerScores = this.players.map(p => ({
        id: p.id,
        // Example: count the total number of 'right' letters
        score: p.letterGrid.flat().filter(letter => letter.result === 'right').length
      }));

      const maxScore = Math.max(...playerScores.map(p => p.score));
      const topPlayers = playerScores.filter(p => p.score === maxScore);

      this.winner = topPlayers.length === 1 ? topPlayers[0].id : null;
    }
  }

  private validateGuess(guess: string): boolean {
    return (
      guess.length === this.wordLength &&
      this.dictionary.has(guess.toLowerCase())
    );
  }

  private calculateResult(guess: string): LetterResult[] {
    const guessLetters = guess.split('');
    const targetLetters = this.targetWord.split('');

    // Mark correct letters first
    const initialResult = guessLetters.map((letter, i) => {
      if (letter === targetLetters[i]) {
        targetLetters[i] = ''; // Remove matched letter from target
        return 'right' as LetterResult;
      }
      return null;
    });

    // Mark misplaced/wrong next
    return guessLetters.map((letter, i) => {
      if (initialResult[i] !== null) {
        return initialResult[i] as LetterResult;
      }
      const foundIndex = targetLetters.indexOf(letter);
      if (foundIndex !== -1) {
        targetLetters[foundIndex] = '';
        return 'misplaced';
      }
      return 'wrong';
    });
  }

  private getPlayer(userId: bigint): Player | null {
    return this.players.find(player => player.id === userId) || null;
  }

  getSnapshot(): GameSnapshot {
    return {
      roomId: this.roomId,
      chatId: this.chatId,
      chatType: this.chatType,
      spectators: [...this.spectators],
      players: this.players.map(player => this.getPlayerSnapshot(player)),
      wordLength: this.wordLength,
      maxAttempts: this.maxAttempts,
      isGameOver: this.isGameOver,
      winner: this.winner,
      language: this.language
    };
  }

  private getPlayerSnapshot(player: Player): PlayerSnapshot {
    return {
      id: player.id,
      name: player.name,
      // Create shallow copies of each row so we don't mutate the original
      letterGrid: player.letterGrid.map(row => [...row]),
      hasWon: player.hasWon,
      online: player.online
    };
  }
}

