import { useState, useEffect, useCallback, useRef } from 'react';
import { storyScenes } from '../data/questions';

// Dynamically import all images from assets/images/
const imageModules = import.meta.glob('../assets/images/*.(jpg|jpeg|png|webp)', { eager: true });

function getImageUrl(filename) {
    for (const [path, module] of Object.entries(imageModules)) {
        if (path.endsWith(filename)) {
            return module.default;
        }
    }
    return null;
}

// Cinematic gradient fallbacks
const gradients = [
    'radial-gradient(ellipse at 30% 50%, rgba(77,0,38,0.95), rgba(15,0,10,1))',
    'radial-gradient(ellipse at 70% 40%, rgba(45,10,50,0.95), rgba(10,0,18,1))',
    'radial-gradient(ellipse at 50% 60%, rgba(60,5,30,0.95), rgba(12,0,15,1))',
    'radial-gradient(ellipse at 40% 30%, rgba(50,0,45,0.95), rgba(8,0,12,1))',
];

// ========= ANIMATED TEXT LINE =========
function AnimatedLine({ text, delay, isVisible }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setShow(false);
            return;
        }
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [isVisible, delay]);

    return (
        <span
            className="block transition-all duration-[1200ms] ease-out"
            style={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0px)' : 'translateY(20px)',
                filter: show ? 'blur(0px)' : 'blur(4px)',
            }}
        >
            {text}
        </span>
    );
}

// ========= SCENE TITLE WITH GLITCH/REVEAL EFFECT =========
function SceneTitle({ title, emoji, sceneNum, total, isVisible }) {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (!isVisible) { setRevealed(false); return; }
        const t = setTimeout(() => setRevealed(true), 400);
        return () => clearTimeout(t);
    }, [isVisible]);

    return (
        <div
            className="text-center mb-8 transition-all duration-[1500ms] ease-out"
            style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
            }}
        >
            {/* Scene counter */}
            <div className="text-rose-400/40 text-xs tracking-[0.3em] uppercase mb-3 font-light">
                {sceneNum} / {total}
            </div>

            {/* Emoji with glow */}
            <div className="text-4xl md:text-5xl mb-4 animate-pulse"
                style={{ textShadow: '0 0 30px rgba(244,63,94,0.4)' }}>
                {emoji}
            </div>

            {/* Title with dramatic styling */}
            <h2
                className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wide"
                style={{
                    background: 'linear-gradient(135deg, #fda4af, #f9a8d4, #c4b5fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    filter: `drop-shadow(0 0 20px rgba(244,63,94,0.3))`,
                }}
            >
                {title}
            </h2>

            {/* Decorative line */}
            <div className="flex justify-center mt-4">
                <div
                    className="h-[1px] transition-all duration-[2000ms] ease-out"
                    style={{
                        width: revealed ? '120px' : '0px',
                        background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent)',
                    }}
                />
            </div>
        </div>
    );
}

// ========= MAIN STORY PLAYER =========
export default function StoryPlayer({ onFinish }) {
    const [currentScene, setCurrentScene] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [sceneVisible, setSceneVisible] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const autoPlayRef = useRef(autoPlay);
    const timerRef = useRef(null);

    useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

    const scene = storyScenes[currentScene];
    const textLines = scene.text.split('\n').filter(l => l.trim());
    const bgImage = getImageUrl(scene.image);
    const isLastScene = currentScene === storyScenes.length - 1;

    // Calculate total reveal time: title (400ms) + each line + buffer
    const totalRevealTime = 400 + textLines.length * 600 + 2500;

    // Scene entrance
    useEffect(() => {
        setSceneVisible(false);
        const enterTimer = setTimeout(() => setSceneVisible(true), 200);
        return () => clearTimeout(enterTimer);
    }, [currentScene]);

    // Auto-play
    useEffect(() => {
        if (!autoPlay || isLastScene) return;

        const autoTime = Math.max(totalRevealTime + 3000, 7000);
        timerRef.current = setTimeout(() => {
            if (autoPlayRef.current) goNext();
        }, autoTime);

        return () => clearTimeout(timerRef.current);
    }, [currentScene, autoPlay]);

    const goNext = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setSceneVisible(false);

        setTimeout(() => {
            if (currentScene < storyScenes.length - 1) {
                setCurrentScene(prev => prev + 1);
            } else {
                onFinish();
            }
            setIsTransitioning(false);
        }, 800);
    }, [currentScene, isTransitioning, onFinish]);

    const goBack = useCallback(() => {
        if (isTransitioning || currentScene === 0) return;
        setIsTransitioning(true);
        setSceneVisible(false);

        setTimeout(() => {
            setCurrentScene(prev => prev - 1);
            setIsTransitioning(false);
        }, 800);
    }, [currentScene, isTransitioning]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden select-none">

            {/* ===== BACKGROUND IMAGE with Ken Burns ===== */}
            {bgImage ? (
                <div
                    key={`bg-${currentScene}`}
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'cinematic-zoom 12s ease-in-out forwards',
                    }}
                />
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ background: gradients[currentScene % gradients.length] }}
                />
            )}

            {/* ===== CINEMATIC OVERLAYS ===== */}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/55" />
            {/* Top gradient for title area */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
            {/* Side vignette */}
            <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
            {/* Romantic film tint */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(190,30,90,0.06), rgba(80,30,180,0.06))' }} />

            {/* ===== FILM GRAIN TEXTURE (subtle) ===== */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ===== LETTERBOX BARS (cinematic widescreen) ===== */}
            <div className="absolute top-0 left-0 right-0 h-8 md:h-12 bg-black z-30" />
            <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12 bg-black z-30" />

            {/* ===== CONTENT ===== */}
            <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-20 md:py-24">

                {/* Scene Title */}
                <SceneTitle
                    title={scene.title}
                    emoji={scene.emoji}
                    sceneNum={currentScene + 1}
                    total={storyScenes.length}
                    isVisible={sceneVisible}
                />

                {/* Story Text — line by line reveal */}
                <div className="max-w-xl mx-auto text-center space-y-2 md:space-y-3">
                    {textLines.map((line, i) => (
                        <AnimatedLine
                            key={`${currentScene}-${i}`}
                            text={line}
                            delay={800 + i * 600}
                            isVisible={sceneVisible}
                        />
                    ))}
                </div>

                {/* Quote marks decoration */}
                <div
                    className="mt-6 text-rose-400/20 text-5xl font-serif transition-opacity duration-1000"
                    style={{ opacity: sceneVisible ? 1 : 0 }}
                >
                    ❝
                </div>
            </div>

            {/* ===== PROGRESS BAR (cinematic, bottom) ===== */}
            <div className="absolute bottom-10 md:bottom-14 left-8 right-8 z-40">
                <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${((currentScene + 1) / storyScenes.length) * 100}%`,
                            background: 'linear-gradient(90deg, #e11d48, #ec4899, #a855f7)',
                            boxShadow: '0 0 10px rgba(236,72,153,0.5)',
                        }}
                    />
                </div>
            </div>

            {/* ===== CONTROLS ===== */}
            <div className="absolute bottom-16 md:bottom-20 left-0 right-0 z-40 flex items-center justify-center gap-4 px-6">
                {/* Back */}
                <button
                    onClick={goBack}
                    disabled={currentScene === 0}
                    className="px-4 py-2 rounded-full text-sm border border-white/15 bg-white/5 text-white/50
                     backdrop-blur-md hover:bg-white/10 hover:text-white/80
                     transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    ← পিছনে
                </button>

                {/* Auto-play toggle */}
                <button
                    onClick={() => setAutoPlay(prev => !prev)}
                    className={`px-4 py-2 rounded-full text-sm border backdrop-blur-md
                      transition-all duration-300
                      ${autoPlay
                            ? 'border-rose-400/40 bg-rose-500/15 text-rose-300'
                            : 'border-white/15 bg-white/5 text-white/50'
                        } hover:bg-white/10`}
                >
                    {autoPlay ? '⏸ থামাও' : '▶ চালাও'}
                </button>

                {/* Next / Finish */}
                <button
                    onClick={goNext}
                    className="px-5 py-2 rounded-full text-sm border border-rose-400/30 bg-rose-500/15
                     text-rose-200 backdrop-blur-md hover:bg-rose-500/25
                     transition-all duration-300"
                >
                    {isLastScene ? '💖 শেষ' : 'পরের →'}
                </button>
            </div>

            {/* ===== Ken Burns Animation ===== */}
            <style>{`
        @keyframes cinematic-zoom {
          0% {
            transform: scale(1.0);
            filter: brightness(0.4);
          }
          15% {
            filter: brightness(0.9);
          }
          85% {
            filter: brightness(0.9);
          }
          100% {
            transform: scale(1.12);
            filter: brightness(0.7);
          }
        }
      `}</style>
        </div>
    );
}
