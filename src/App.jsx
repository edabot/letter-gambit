import { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Zap, Lightbulb } from 'lucide-react';
import { PHRASES } from './phrases';
import './App.css';

// Letter costs (reversed from Scrabble)
const LETTER_COSTS = {
  'E': 10, 'A': 10, 'I': 10, 'O': 10, 'N': 10, 'R': 10, 'T': 10, 'L': 10, 'S': 10, 'U': 10,
  'D': 8, 'G': 8,
  'B': 5, 'C': 5, 'M': 5, 'P': 5,
  'F': 3, 'H': 3, 'V': 3, 'W': 3, 'Y': 3,
  'K': 2,
  'J': 1, 'X': 1, 'Q': 1, 'Z': 1
};

const WRONG_GUESS_PENALTY = 15;
const STARTING_BUDGET = 100;
const HINT_COST = 20;

function App() {
  const [targetPhrase, setTargetPhrase] = useState('');
  const [theme, setTheme] = useState('');
  const [hint, setHint] = useState('');
  const [hintRevealed, setHintRevealed] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(new Set());
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [guessInput, setGuessInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if game is over or if user is typing in the guess input
      if (gameOver || document.activeElement.tagName === 'INPUT') {
        return;
      }

      const key = e.key.toUpperCase();
      // Check if it's a letter A-Z
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        // Check if this letter exists in our cost table
        if (LETTER_COSTS[key]) {
          buyLetter(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, revealedLetters, budget, targetPhrase, purchaseHistory]);

  const startNewGame = () => {
    const selected = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setTargetPhrase(selected.phrase);
    setTheme(selected.theme);
    setHint(selected.hint);
    setHintRevealed(false);
    setRevealedLetters(new Set([' '])); // Always reveal spaces
    setBudget(STARTING_BUDGET);
    setGuessInput('');
    setGameOver(false);
    setWon(false);
    setPurchaseHistory([]);
  };

  const buyLetter = (letter) => {
    if (gameOver) return;
    if (revealedLetters.has(letter)) {
      return;
    }

    const cost = LETTER_COSTS[letter];
    if (budget < cost) {
      return;
    }

    const newRevealed = new Set(revealedLetters);
    newRevealed.add(letter);
    setRevealedLetters(newRevealed);

    const newBudget = budget - cost;
    setBudget(newBudget);

    const inPhrase = targetPhrase.includes(letter);
    const count = targetPhrase.split('').filter(c => c === letter).length;

    setPurchaseHistory(prev => [...prev, {
      letter,
      cost,
      inPhrase,
      count
    }]);

    if (newBudget <= 0) {
      setGameOver(true);
    }
  };

  const makeGuess = () => {
    if (gameOver) return;

    const normalizedGuess = guessInput.toUpperCase().trim();
    if (normalizedGuess === targetPhrase) {
      setWon(true);
      setGameOver(true);
    } else {
      const newBudget = budget - WRONG_GUESS_PENALTY;
      setBudget(newBudget);

      if (newBudget <= 0) {
        setGameOver(true);
      }
    }
    setGuessInput('');
  };

  const buyHint = () => {
    if (gameOver || hintRevealed) return;

    if (budget < HINT_COST) {
      return;
    }

    const newBudget = budget - HINT_COST;
    setBudget(newBudget);
    setHintRevealed(true);

    if (newBudget <= 0) {
      setGameOver(true);
    }
  };

  const renderPhrase = () => {
    const words = targetPhrase.split(' ');
    return words.map((word, wordIdx) => (
      <span key={wordIdx} className="word-group">
        {word.split('').map((char, charIdx) => (
          <span key={charIdx} className="letter-tile">
            {revealedLetters.has(char) || won ? char : ''}
          </span>
        ))}
      </span>
    ));
  };

  const getLettersByGroup = () => {
    return [
      { cost: 10, letters: ['A', 'E', 'I', 'O', 'U'], label: 'Common Vowels (10 pts)' },
      { cost: 10, letters: ['L', 'N', 'R', 'S', 'T'], label: 'Common Consonants (10 pts)' },
      { cost: 8, letters: ['D', 'G'], label: 'Uncommon (8 pts)' },
      { cost: 5, letters: ['B', 'C', 'M', 'P'], label: 'Moderate (5 pts)' },
      { cost: 3, letters: ['F', 'H', 'V', 'W', 'Y'], label: 'Rare (3 pts)' },
      { cost: 2, letters: ['K'], label: 'Very Rare (2 pts)' },
      { cost: 1, letters: ['J', 'Q', 'X', 'Z'], label: 'Ultra Rare (1 pt)' }
    ];
  };

  const getScoreRating = () => {
    if (budget >= 70) return { text: 'MASTERFUL', color: '#10b981' };
    if (budget >= 50) return { text: 'EXCELLENT', color: '#3b82f6' };
    if (budget >= 30) return { text: 'GOOD', color: '#8b5cf6' };
    if (budget >= 10) return { text: 'DECENT', color: '#f59e0b' };
    return { text: 'SURVIVED', color: '#ef4444' };
  };

  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title">Letter Gambit</h1>
      </div>

      <div className="phrase-section">
        <div className="theme-display">
          Theme: {theme}
        </div>
        <div className="phrase-display">
          {renderPhrase()}
        </div>
      </div>

      <div className="info-bar">
        <div className="info-section">
          <div className="info-label">Budget Remaining:</div>
          <div className={`budget-value ${budget <= 20 ? 'low' : ''}`}>{budget} pts</div>
        </div>
        {purchaseHistory.length > 0 && (
          <>
            <div className="info-section">
              <div className="info-label">Hits:</div>
              <div className="letter-history">
                {purchaseHistory.filter(h => h.inPhrase).map((h, i) => (
                  <span key={i} className="history-letter hit">{h.letter}</span>
                ))}
              </div>
            </div>
            <div className="info-section">
              <div className="info-label">Misses:</div>
              <div className="letter-history">
                {purchaseHistory.filter(h => !h.inPhrase).map((h, i) => (
                  <span key={i} className="history-letter miss">{h.letter}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {gameOver && won && (
        <div className="victory-screen">
          <div className="game-over-title" style={{ color: '#10b981' }}>🎉 Victory! 🎉</div>
          <div className="final-score">Final Score: {budget} points</div>
          <div className="rating" style={{ color: getScoreRating().color }}>
            {getScoreRating().text}
          </div>
          <div className="controls">
            <button className="btn" onClick={startNewGame}>
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameOver && !won && (
        <div className="defeat-screen">
          <div className="game-over-title" style={{ color: '#ef4444' }}>Game Over</div>
          <div className="final-score">The answer was: {targetPhrase}</div>
          <div className="controls">
            <button className="btn" onClick={startNewGame}>
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {!gameOver && (
        <>
          <div className="letter-groups">
            {getLettersByGroup().map(group => (
              <div key={group.cost} className="letter-group">
                <div className="group-label">{group.label}</div>
                <div className="letter-buttons">
                  {group.letters.map(letter => (
                    <button
                      key={letter}
                      className={`letter-btn cost-${group.cost}`}
                      onClick={() => buyLetter(letter)}
                      disabled={revealedLetters.has(letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hint-section">
            <button
              className="btn btn-hint"
              onClick={buyHint}
              disabled={hintRevealed || budget < HINT_COST}
            >
              <Lightbulb size={20} />
              {hintRevealed ? 'Hint Used' : `Get Hint (${HINT_COST} pts)`}
            </button>
            {hintRevealed && (
              <div className="hint-display">
                💡 {hint}
              </div>
            )}
          </div>

          <div className="guess-section">
            <div className="guess-label">
              <Zap size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Solve the Phrase ({WRONG_GUESS_PENALTY} point penalty for wrong guess)
            </div>
            <div className="guess-controls">
              <input
                type="text"
                className="guess-input"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
                placeholder="Type your guess..."
              />
              <button className="btn" onClick={makeGuess} disabled={!guessInput.trim()}>
                <Sparkles size={20} />
                Guess
              </button>
            </div>
          </div>
        </>
      )}

      <div className="controls">
        <button className="btn btn-secondary" onClick={startNewGame}>
          <RotateCcw size={20} />
          New Game
        </button>
      </div>
    </div>
  );
}

export default App;
