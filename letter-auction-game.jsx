import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Trophy, Zap } from 'lucide-react';

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

// Phrase bank
const PHRASES = [
  "FLIMSY FOREVER",
  "FUZZY LOGIC",
  "QUICK BROWN FOX",
  "JAZZ MUSIC VIBES",
  "PIXEL PERFECT",
  "COSMIC ENERGY",
  "WINTER WONDERLAND",
  "GOLDEN SUNSET",
  "BRAVE NEW WORLD",
  "ELECTRIC DREAMS",
  "PAPER AIRPLANE",
  "SILVER LINING",
  "RUBBER DUCKY",
  "NEON LIGHTS",
  "CRYSTAL CLEAR"
];

const LetterAuctionGame = () => {
  const [targetPhrase, setTargetPhrase] = useState('');
  const [revealedLetters, setRevealedLetters] = useState(new Set());
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [guessInput, setGuessInput] = useState('');
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setTargetPhrase(phrase);
    setRevealedLetters(new Set([' '])); // Always reveal spaces
    setBudget(STARTING_BUDGET);
    setGuessInput('');
    setMessage('Buy letters strategically! Rare letters are cheap, common ones are expensive.');
    setGameOver(false);
    setWon(false);
    setPurchaseHistory([]);
  };

  const buyLetter = (letter) => {
    if (gameOver) return;
    if (revealedLetters.has(letter)) {
      setMessage(`You already bought ${letter}!`);
      return;
    }

    const cost = LETTER_COSTS[letter];
    if (budget < cost) {
      setMessage(`Not enough budget! ${letter} costs ${cost} points.`);
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

    if (inPhrase) {
      setMessage(`✓ ${letter} appears ${count} time${count > 1 ? 's' : ''}! (-${cost} pts)`);
    } else {
      setMessage(`✗ ${letter} is not in the phrase. (-${cost} pts)`);
    }

    if (newBudget <= 0) {
      setGameOver(true);
      setMessage(`Out of budget! The answer was: ${targetPhrase}`);
    }
  };

  const makeGuess = () => {
    if (gameOver) return;
    
    const normalizedGuess = guessInput.toUpperCase().trim();
    if (normalizedGuess === targetPhrase) {
      setWon(true);
      setGameOver(true);
      setMessage(`🎉 Correct! You won with ${budget} points remaining!`);
    } else {
      const newBudget = budget - WRONG_GUESS_PENALTY;
      setBudget(newBudget);
      setMessage(`✗ Wrong guess! (-${WRONG_GUESS_PENALTY} pts)`);
      
      if (newBudget <= 0) {
        setGameOver(true);
        setMessage(`Out of budget! The answer was: ${targetPhrase}`);
      }
    }
    setGuessInput('');
  };

  const renderPhrase = () => {
    return targetPhrase.split('').map((char, idx) => {
      if (char === ' ') {
        return <span key={idx} className="letter-space"></span>;
      }
      return (
        <span key={idx} className="letter-tile">
          {revealedLetters.has(char) ? char : ''}
        </span>
      );
    });
  };

  const getLettersByGroup = () => {
    return [
      { cost: 10, letters: ['E', 'A', 'I', 'O', 'N', 'R', 'T', 'L', 'S', 'U'], label: 'Common (10 pts)' },
      { cost: 8, letters: ['D', 'G'], label: 'Uncommon (8 pts)' },
      { cost: 5, letters: ['B', 'C', 'M', 'P'], label: 'Moderate (5 pts)' },
      { cost: 3, letters: ['F', 'H', 'V', 'W', 'Y'], label: 'Rare (3 pts)' },
      { cost: 2, letters: ['K'], label: 'Very Rare (2 pts)' },
      { cost: 1, letters: ['J', 'X', 'Q', 'Z'], label: 'Ultra Rare (1 pt)' }
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          font-family: 'DM Mono', monospace;
        }

        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          color: #fff;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .title {
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 900;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -2px;
          text-transform: uppercase;
        }

        .subtitle {
          color: #a78bfa;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .stat-label {
          font-size: 0.75rem;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 500;
          color: #fff;
        }

        .stat-value.low {
          color: #ef4444;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .phrase-display {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(167, 139, 250, 0.3);
          border-radius: 16px;
          padding: 3rem 2rem;
          margin-bottom: 2rem;
          text-align: center;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .letter-tile {
          width: 50px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .letter-tile:empty {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }

        .letter-space {
          width: 20px;
          height: 60px;
          display: inline-block;
        }

        .message-box {
          background: rgba(167, 139, 250, 0.1);
          border-left: 4px solid #a78bfa;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          font-size: 0.95rem;
          color: #e9d5ff;
        }

        .letter-groups {
          margin-bottom: 2rem;
        }

        .letter-group {
          margin-bottom: 1.5rem;
        }

        .group-label {
          font-size: 0.75rem;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 0.75rem;
        }

        .letter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .letter-btn {
          width: 50px;
          height: 50px;
          border: 2px solid;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 1.2rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .letter-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
        }

        .letter-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .letter-btn.cost-10 { border-color: #ef4444; }
        .letter-btn.cost-8 { border-color: #f59e0b; }
        .letter-btn.cost-5 { border-color: #eab308; }
        .letter-btn.cost-3 { border-color: #22c55e; }
        .letter-btn.cost-2 { border-color: #10b981; }
        .letter-btn.cost-1 { border-color: #06b6d4; }

        .guess-section {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(167, 139, 250, 0.3);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .guess-label {
          font-size: 0.85rem;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }

        .guess-controls {
          display: flex;
          gap: 1rem;
        }

        .guess-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(167, 139, 250, 0.3);
          border-radius: 8px;
          padding: 1rem 1.5rem;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 1rem;
          text-transform: uppercase;
        }

        .guess-input:focus {
          outline: none;
          border-color: #a78bfa;
        }

        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 1rem 2rem;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .victory-screen {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          border: 2px solid #10b981;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .defeat-screen {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
          border: 2px solid #ef4444;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .game-over-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
        }

        .final-score {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .rating {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>

      <div className="header">
        <h1 className="title">Letter Auction</h1>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">Budget</div>
          <div className={`stat-value ${budget <= 20 ? 'low' : ''}`}>{budget}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Penalty</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: '#ef4444' }}>-{WRONG_GUESS_PENALTY}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Letters Bought</div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{revealedLetters.size - 1}</div>
        </div>
      </div>

      <div className="phrase-display">
        {renderPhrase()}
      </div>

      <div className="message-box">
        {message}
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
                onKeyPress={(e) => e.key === 'Enter' && makeGuess()}
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
};

export default LetterAuctionGame;
