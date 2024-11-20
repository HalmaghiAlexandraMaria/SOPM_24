import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('start');
  const [mode, setMode] = useState(null);
  const [playerXSymbol, setPlayerXSymbol] = useState('❌');   //am prestabilit un emoji
  const [playerOSymbol, setPlayerOSymbol] = useState('⭕');
  const [timerX, setTimerX] = useState(0);
  const [timerO, setTimerO] = useState(0);
  const [pauseTimeX, setPauseTimeX] = useState(0); // Pentru a salva timpul de pauză pentru jucătorul 1
  const [pauseTimeO, setPauseTimeO] = useState(0); // Pentru a salva timpul de pauză pentru jucătorul 2
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);//indic randul
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Starea pentru pauză
  const [showEmojiListX, setShowEmojiListX] = useState(false);
  const [showEmojiListO, setShowEmojiListO] = useState(false);

  const emojiOptions = ['❌', '⭕', '❤️','💘', '⭐', '🍀', '😊', '😎', '🐱', '🌈', '🤖','😂','🤑','👻','🐕','🐱','🌸','🧸','⚠️','🎓'];
  const [availableEmojis] = useState(emojiOptions);

  
  // Timer pentru fiecare jucător, opreste componenta cand se schimba starea
  useEffect(() => {
    let interval;
    if (!isGameOver && !isPaused) {
      if (isXNext) {
        interval = setInterval(() => setTimerX((prev) => prev + 1), 1000);
      } else {
        interval = setInterval(() => setTimerO((prev) => prev + 1), 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isXNext, isGameOver, isPaused]);
//pornesc jocul cu selectia
  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setPage('game');
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setIsGameOver(false);
    setTimerX(0);
    setTimerO(0);
    setIsPaused(false); // Resetăm pauza
    setPauseTimeX(0);
    setPauseTimeO(0);

// Dacă modul este AI și nu este rândul jucatorului 1, AI face prima mutare
    if (mode === 'ai' && !isXNext) {
      setTimeout(() => makeAIMove(Array(9).fill(null)), 1000);
    }
  };
//functia pt calcularea castigatorului
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const isBoardFull = (squares) => squares.every((cell) => cell !== null);

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner || isBoardFull(board)) {
      setIsGameOver(true);
    } else if (mode === 'ai' && !isXNext && !isPaused) {
      setTimeout(() => makeAIMove(board), 1000);
    }
  }, [winner, board, mode, isXNext, isPaused, isGameOver]);

  const handleClick = (index) => {
    if (board[index] || winner || isGameOver || isPaused) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? playerXSymbol : playerOSymbol;
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const makeAIMove = (currentBoard) => {
    const availableMoves = currentBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);

    // 1. Verificăm dacă jucătorul uman are o mutare câștigătoare și blocăm
    for (let i = 0; i < availableMoves.length; i++) {
      const boardCopy = currentBoard.slice();
      const move = availableMoves[i];
      boardCopy[move] = playerOSymbol;
      if (calculateWinner(boardCopy) === playerOSymbol) {
        setBoard(boardCopy);
        setIsXNext(true);
        return;
      }
    }

    // 2.  Blochează mutarea câștigătoare a jucătorului uman in cazul in care apare sau exista
    for (let i = 0; i < availableMoves.length; i++) {
      const boardCopy = currentBoard.slice();
      const move = availableMoves[i];
      boardCopy[move] = playerXSymbol;
      if (calculateWinner(boardCopy) === playerXSymbol) {
        currentBoard[move] = playerOSymbol;  // Blocăm mutarea câștigătoare
        setBoard(currentBoard);
        setIsXNext(true);
        return;
      }
    }

    // 3. Mută aleatoriu dacă nu există mutări critice pt AI
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    currentBoard[randomMove] = playerOSymbol;
    setBoard(currentBoard);
    setIsXNext(true);
  };

  const selectEmoji = (symbol, isX) => {
    console.log(`Selectat emoji: ${symbol} pentru jucătorul ${isX ? 'X' : 'O'}`);
    if (isX) {
      if (symbol !== playerOSymbol) {
        setPlayerXSymbol(symbol);
      }
    } else {
      if (symbol !== playerXSymbol) {
        setPlayerOSymbol(symbol);
      }
    }
  };

//Funcția pentru a pune pauză
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      // Când reluăm jocul, continuăm timerul
      setTimerX(pauseTimeX);
      setTimerO(pauseTimeO);
    } else {
      // Când punem pe pauză, salvăm timpul
      setPauseTimeX(timerX);
      setPauseTimeO(timerO);
    }
  };

  return (
    <div className="App">
      {page === 'start' && (
        <div className="start-page">
          <h1>Joc X și 0</h1>
          <button className="play-button" onClick={() => setPage('mode')}>Play</button>
        </div>
      )}

      {page === 'mode' && (
        <div className="mode-page">
          <h2>Alege modul de joc</h2>
          <button onClick={() => startGame('local')}>👥 2 Jucători</button>
          <button onClick={() => startGame('ai')}>🤖 Joc cu AI</button>

          <div className="emoji-select">
            <button onClick={() => setShowEmojiListX(!showEmojiListX)}>
              Alege emoji pentru Jucatorul 1: {playerXSymbol}
            </button>
            {showEmojiListX && (
              <div className="emoji-list">
                {availableEmojis.map((emoji) => (
                  <span key={emoji} onClick={() => selectEmoji(emoji, true)}
                  className={emoji === playerOSymbol ? 'emoji-fade' : ''}>

                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="emoji-select">
            <button onClick={() => setShowEmojiListO(!showEmojiListO)}>
              Alege emoji pentru Jucatorul 2: {playerOSymbol}
            </button>
            {showEmojiListO && (
              <div className="emoji-list">
                {availableEmojis.map((emoji) => (
                  <span key={emoji} onClick={() => selectEmoji(emoji, false)}
                  className={emoji === playerXSymbol ? 'emoji-fade' : ''}>
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {page === 'game' && (
        <div className="game-page">
          <h2>Joc în desfășurare</h2>
          <div className="timer">
            <div>Jucător 1 {playerXSymbol} :  {timerX}s</div>
            <div>Jucător 2 {playerOSymbol} :  {timerO}s</div>
          </div>

          <div className="board">
            {board.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>

          <div className="buttons">
            <button onClick={togglePause}>{isPaused ? 'Reluați jocul' : 'Pune pe pauză'}</button>
            <button onClick={resetGame}>Reîncepe jocul</button>
            <button onClick={() => setPage('start')}>Înapoi în meniu</button>
          </div>

          {isGameOver && (
            <div className="game-over">
              <h3>{winner ? `${winner} a câștigat!` : 'Remiză!'}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
