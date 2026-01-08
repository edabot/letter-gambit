# Letter Gambit

A strategic word guessing game where rare letters are cheap and common letters are expensive!

## Game Rules

- Start with 100 points
- Buy letters to reveal them in the hidden phrase
- Letter costs are REVERSED from Scrabble:
  - Rare letters (Q, Z, J, X): 1 point
  - Very Rare (K): 2 points
  - Rare (F, H, V, W, Y): 3 points
  - Moderate (B, C, M, P): 5 points
  - Uncommon (D, G): 8 points
  - Common vowels (E, A, I, O, N, R, T, L, S, U): 10 points
- Wrong phrase guesses cost 15 points
- Win by solving the phrase with points remaining!

## Strategy

The twist is that common letters are expensive! You must decide:
- Gamble on cheap rare letters to narrow down possibilities?
- Pay premium for expensive vowels when you need them?
- Risk a guess to save points, or buy more letters for certainty?

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play!

## Build

```bash
npm run build
```

## Tech Stack

- React 18
- Vite
- Lucide React (icons)

---

Good luck! Can you beat the game with a MASTERFUL score (70+ points remaining)?
