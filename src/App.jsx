import { useState, useRef, useEffect, useCallback } from 'react';
import Welcome from './components/Welcome';
import QuestionStep from './components/QuestionStep';
import Transition from './components/Transition';
import StoryPlayer from './components/StoryPlayer';
import Finale from './components/Finale';
import { questions } from './data/questions';

/*
  App Flow:
  0. loader      → Preloads images + music, shows animated loader
  1. welcome     → Welcome screen with floating hearts
  2. questions   → Funny question flow (multi-step)
  3. transition  → "You passed!" bridge screen
  4. story       → Cinematic storytelling slides
  5. finale      → Confetti + glowing heart celebration
*/

// ========= PERSISTENT AUDIO (survives all re-renders) =========
const bgAudio = new Audio('/bg-music.mp3');
bgAudio.loop = true;
bgAudio.volume = 0.4;
bgAudio.preload = 'auto';

// Keep music alive — if it pauses unexpectedly, restart it
let musicShouldPlay = false;
bgAudio.addEventListener('pause', () => {
  if (musicShouldPlay && !bgAudio.ended) {
    setTimeout(() => {
      if (musicShouldPlay) {
        bgAudio.play().catch(() => { });
      }
    }, 200);
  }
});
bgAudio.addEventListener('error', () => {
  if (musicShouldPlay) {
    setTimeout(() => {
      bgAudio.load();
      bgAudio.play().catch(() => { });
    }, 1000);
  }
});

// ========= LOADER COMPONENT =========
function Loader({ progress, message }) {
  return (
    <div className="fixed inset-0 z-[200] bg-romantic flex flex-col items-center justify-center">
      {/* Animated hearts */}
      <div className="relative mb-10">
        <div className="text-7xl animate-heartbeat">💕</div>
        <div className="absolute -top-4 -right-6 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute -bottom-2 -left-5 text-xl animate-bounce" style={{ animationDelay: '0.7s' }}>🌹</div>
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 bg-clip-text text-transparent text-glow">
        Loading your surprise...
      </h2>
      <p className="text-rose-300/50 text-sm mb-8">{message}</p>

      {/* Progress bar */}
      <div className="w-64 md:w-80 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #e11d48, #ec4899, #a855f7)',
            boxShadow: '0 0 20px rgba(236,72,153,0.5)',
          }}
        />
      </div>
      <p className="text-rose-300/40 text-xs mt-3">{Math.round(progress)}%</p>

      {/* Sparkle dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="sparkle-dot"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

// ========= MAIN APP =========
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadMessage, setLoadMessage] = useState('Preparing something special...');
  const [fadeIn, setFadeIn] = useState(false);
  const [screen, setScreen] = useState('welcome');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);

  // ===== PRELOAD EVERYTHING =====
  useEffect(() => {
    let cancelled = false;

    async function preloadAll() {
      const tasks = [];
      let completed = 0;

      // 1. Preload music
      setLoadMessage('Loading music 🎵');
      const musicPromise = new Promise((resolve) => {
        if (bgAudio.readyState >= 4) {
          resolve(); // Already loaded
        } else {
          bgAudio.addEventListener('canplaythrough', resolve, { once: true });
          bgAudio.addEventListener('error', resolve, { once: true }); // Don't block on error
          bgAudio.load();
        }
        // Timeout fallback — don't wait forever
        setTimeout(resolve, 5000);
      });
      tasks.push(musicPromise);

      // 2. Preload all images from assets
      setLoadMessage('Loading your photos 📸');
      const imageModules = import.meta.glob('./assets/images/*.(jpg|jpeg|png|webp)', { eager: true });
      const imageUrls = Object.values(imageModules).map(m => m.default);

      for (const url of imageUrls) {
        const imgPromise = new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Don't block on error
          img.src = url;
          setTimeout(resolve, 4000); // Timeout fallback
        });
        tasks.push(imgPromise);
      }

      const totalTasks = tasks.length;

      // Track progress
      for (const task of tasks) {
        await task;
        completed++;
        if (!cancelled) {
          const pct = Math.round((completed / totalTasks) * 100);
          setLoadProgress(pct);
          if (completed <= 1) setLoadMessage('Loading music 🎵');
          else setLoadMessage(`Loading photos (${completed - 1}/${imageUrls.length}) 📸`);
        }
      }

      // Done!
      if (!cancelled) {
        setLoadMessage('All set! 💖');
        setLoadProgress(100);
        // Small delay, then fade in
        await new Promise(r => setTimeout(r, 600));
        setFadeIn(true);
        await new Promise(r => setTimeout(r, 800));
        setIsLoaded(true);
      }
    }

    preloadAll();
    return () => { cancelled = true; };
  }, []);

  // Start music on user click
  const handleStart = () => {
    setScreen('questions');
    musicShouldPlay = true;
    bgAudio.currentTime = 0;
    bgAudio.play()
      .then(() => setMusicStarted(true))
      .catch(() => {
        setTimeout(() => {
          bgAudio.play()
            .then(() => setMusicStarted(true))
            .catch(() => { });
        }, 300);
      });
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setScreen('transition');
    }
  };

  const handleTransitionContinue = () => setScreen('story');
  const handleStoryFinish = () => setScreen('finale');

  const toggleMute = () => {
    bgAudio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // ===== LOADING SCREEN =====
  if (!isLoaded) {
    return <Loader progress={loadProgress} message={loadMessage} />;
  }

  // ===== MAIN APP =====
  return (
    <div className={`font-outfit min-h-screen bg-romantic transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* 🔊 Music toggle */}
      {musicStarted && (
        <button
          onClick={toggleMute}
          className="fixed top-5 left-5 z-[100] w-12 h-12 rounded-full
                     bg-white/10 border border-white/20 backdrop-blur-md
                     flex items-center justify-center
                     hover:bg-white/20 hover:scale-110
                     transition-all duration-300 text-xl
                     shadow-lg shadow-rose-500/20"
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? '🔇' : '🎵'}
        </button>
      )}

      {screen === 'welcome' && <Welcome onStart={handleStart} />}

      {screen === 'questions' && (
        <QuestionStep
          question={questions[questionIndex].question}
          noTexts={questions[questionIndex].noTexts}
          onNext={handleNextQuestion}
          questionIndex={questionIndex}
          totalQuestions={questions.length}
        />
      )}

      {screen === 'transition' && <Transition onContinue={handleTransitionContinue} />}
      {screen === 'story' && <StoryPlayer onFinish={handleStoryFinish} />}
      {screen === 'finale' && <Finale />}
    </div>
  );
}
