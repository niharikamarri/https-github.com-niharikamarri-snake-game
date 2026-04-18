import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, Music, Trophy, RefreshCcw, Volume2, Database, Activity } from 'lucide-react';

// Types
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 150;

const TRACKS = [
  {
    id: 1,
    title: "NEURAL_LINK.WAV",
    artist: "CYBER_GHOST",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#00f3ff"
  },
  {
    id: 2,
    title: "SYNTH_PULSE.MP3",
    artist: "DATA_DRIVE",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#ff00ff"
  },
  {
    id: 3,
    title: "GLITCH_DREAM.FLAC",
    artist: "S_Y_S_T_E_M",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#fff300"
  }
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Game Logic
  const generateFood = useCallback((snakeBody: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snakeBody.some(segment => segment.x === newFood?.x && segment.y === newFood?.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Border collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      switch (key) {
        case 'arrowup': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'arrowdown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'arrowleft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'arrowright': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': 
          e.preventDefault();
          setIsPaused(p => !p); 
          break;
        case 'r': 
          resetGame(); 
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // Music Logic
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback error", e));
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-black font-mono overflow-hidden">
      <div className="crt-noise" />
      <div className="scanline" />

      {/* Header Info */}
      <div className="absolute top-8 left-8 space-y-2 opacity-60 hidden md:block">
        <div className="flex items-center gap-2 text-neon-cyan">
          <Database size={16} />
          <span className="text-xs">SYSTEM://STATUS: ONLINE</span>
        </div>
        <div className="flex items-center gap-2 text-neon-magenta">
          <Activity size={16} />
          <span className="text-xs">NEURAL_LOAD: 42%</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Stats */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-4 border-[4px] border-neon-cyan bg-black/40 backdrop-blur-md rounded-lg shadow-[0_0_30px_var(--color-neon-cyan)]">
              <div className="flex items-center gap-2 mb-4 text-neon-cyan">
                <Trophy size={18} />
                <span className="text-sm tracking-widest font-bold">ARCADE_DATA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/40 mb-1">CURRENT_SCORE</p>
                  <p className="text-3xl font-game text-neon-cyan">{score.toString().padStart(6, '0')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 mb-1">HIGH_SCORE</p>
                  <p className="text-xl font-game text-white/60">{highScore.toString().padStart(6, '0')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-black/40 backdrop-blur-md rounded-lg">
              <p className="text-[10px] text-white/40 mb-2 uppercase italic">Commands</p>
              <ul className="text-[10px] space-y-1 text-white/60 font-sans">
                <li>[ ARROWS ] : NAVIGATION</li>
                <li>[ SPACE ] : TRANSMISSION PAUSE</li>
                <li>[ R ] : REBOOT SEQUENCE</li>
              </ul>
            </div>
          </div>

          {/* Center Panel: Game */}
          <div className="lg:col-span-6 relative aspect-square">
            <div className="absolute -inset-2 bg-gradient-to-tr from-neon-cyan/20 to-neon-magenta/20 blur-xl opacity-50" />
            <div className="relative h-full border-2 border-white/10 p-1 bg-black/30 backdrop-blur-sm shadow-2xl overflow-hidden rounded-xl">
              
              <div className="game-grid relative">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const isSnake = snake.some(s => s.x === x && s.y === y);
                  const isHead = snake[0].x === x && snake[0].y === y;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <div 
                      key={i} 
                      className={`game-cell ${isSnake ? 'snake' : ''} ${isHead ? 'head' : ''} ${isFood ? 'food' : ''}`}
                    />
                  );
                })}

                {/* Overlays */}
                <AnimatePresence>
                  {isPaused && !gameOver && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm"
                    >
                      <div className="text-center group cursor-pointer flex flex-col items-center" onClick={() => setIsPaused(false)}>
                        <div className="mb-6 border-[3px] border-[#3b82f6] px-4 py-1 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          <span className="text-2xl font-bold font-sans tracking-widest text-transparent" style={{ WebkitTextStroke: '1px #60a5fa', textShadow: '0 0 10px rgba(96,165,250,0.8)' }}>
                            snake game
                          </span>
                        </div>
                        <h2 className="text-4xl font-black italic glitch-text mb-4 text-neon-cyan">PAUSED</h2>
                        <p className="text-xs tracking-widest animate-pulse font-sans">PRESS SPACE TO RESUME</p>
                      </div>
                    </motion.div>
                  )}

                  {gameOver && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 bg-neon-magenta/20 flex items-center justify-center z-20 backdrop-blur-lg border-2 border-neon-magenta"
                    >
                      <div className="text-center p-8 bg-black/90 rounded-2xl neon-border border-neon-magenta">
                        <h2 className="text-5xl font-black glitch-text mb-2 text-neon-magenta">DECEASED</h2>
                        <p className="text-sm mb-6 text-white/60">COLLECTION_TERMINATED AT {score} PTS</p>
                        <button 
                          onClick={resetGame}
                          className="px-6 py-2 bg-neon-magenta text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 mx-auto"
                        >
                          <RefreshCcw size={18} />
                          RESTART
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Panel: Music Player */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 border border-white/10 bg-black/40 backdrop-blur-md rounded-lg relative overflow-hidden">
              <div 
                className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20" 
                style={{ backgroundColor: currentTrack.color }}
              />
              
              <div className="flex items-center gap-2 mb-6 text-neon-magenta">
                <Music size={18} />
                <span className="text-sm tracking-widest font-bold">SONIC_VOID</span>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div 
                    className="aspect-square bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden"
                  >
                    <motion.div
                      animate={{ 
                        scale: isPlaying ? [1, 1.1, 1] : 1,
                        rotate: isPlaying ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Music size={64} className="opacity-20 translate-y-4" style={{ color: currentTrack.color }} />
                    </motion.div>
                    
                    {/* Fake Visualizer bars */}
                    <div className="absolute bottom-2 left-0 right-0 px-4 flex items-end justify-center gap-1 h-12">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: isPlaying ? [10, 40, 20, 30, 15] : 4 }}
                          transition={{ 
                            duration: 0.5 + Math.random(), 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                          className="w-1 rounded-t-full bg-white/20"
                          style={{ backgroundColor: isPlaying ? currentTrack.color : undefined }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-white truncate glitch-text">{currentTrack.title}</h3>
                  <p className="text-xs text-white/40 mt-1 uppercase tracking-tighter">{currentTrack.artist}</p>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button 
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white text-black hover:bg-neon-cyan transition-all transform active:scale-95"
                  >
                    {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  </button>
                  <button 
                    onClick={skipTrack}
                    className="p-2 text-white/60 hover:text-neon-magenta transition-colors"
                  >
                    <SkipForward size={24} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] text-white/20">
                    <span>BIT_RATE: 320KBPS</span>
                    <span>STEREO</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-neon-cyan" 
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 180, ease: "linear" }} /* Rough guess for a 3min song */
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-black/40 rounded-lg flex items-center justify-between">
              <Volume2 size={14} className="text-white/40" />
              <div className="flex-1 mx-4 h-0.5 bg-white/10 rounded-full">
                <div className="w-2/3 h-full bg-white/20" />
              </div>
              <span className="text-[10px] text-white/40">70%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Audio (Hidden) */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onEnded={skipTrack}
        loop={false}
      />

      <div className="fixed bottom-4 right-4 text-[10px] text-white/20 flex items-center gap-4">
        <span>EST. 2099 // NEURAL_CORP</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}
