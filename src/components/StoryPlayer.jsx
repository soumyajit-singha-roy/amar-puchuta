import { useState, useEffect, useRef } from 'react';
import { storyScenes } from '../data/questions';

// Dynamically import all images from assets/images/
const imageModules = import.meta.glob('../assets/images/*.(jpg|jpeg|png|webp)', { eager: true });

function getImageUrl(filename) {
    // Try to find the image in the imported modules
    for (const [path, module] of Object.entries(imageModules)) {
        if (path.endsWith(filename)) {
            return module.default;
        }
    }
    return null;
}

export default function StoryPlayer({ onFinish }) {
    const [currentScene, setCurrentScene] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [titleVisible, setTitleVisible] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);
    const autoPlayRef = useRef(null);

    const totalScenes = storyScenes.length;
    const scene = storyScenes[currentScene];
    const bgImage = getImageUrl(scene.image);

    // Text reveal timing
    useEffect(() => {
        setTitleVisible(false);
        setTextVisible(false);

        const t1 = setTimeout(() => setTitleVisible(true), 600);
        const t2 = setTimeout(() => setTextVisible(true), 1200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [currentScene]);

    // Auto-play logic
    useEffect(() => {
        if (autoPlay && currentScene < totalScenes - 1) {
            autoPlayRef.current = setTimeout(() => {
                goNext();
            }, 6000); // 6 seconds per scene for reading
        }
        return () => {
            if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
        };
    }, [autoPlay, currentScene]);

    const goNext = () => {
        if (currentScene >= totalScenes - 1) {
            onFinish();
            return;
        }
        setIsTransitioning(true);
        setTextVisible(false);
        setTitleVisible(false);
        setTimeout(() => {
            setCurrentScene(prev => prev + 1);
            setIsTransitioning(false);
        }, 1000);
    };

    const goPrev = () => {
        if (currentScene <= 0) return;
        setIsTransitioning(true);
        setTextVisible(false);
        setTitleVisible(false);
        setTimeout(() => {
            setCurrentScene(prev => prev - 1);
            setIsTransitioning(false);
        }, 1000);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">

            {/* ===== FULL-SCREEN BACKGROUND IMAGE ===== */}
            <div
                key={`bg-${currentScene}`}
                className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {bgImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            animation: 'slowZoom 12s ease-in-out forwards',
                        }}
                    />
                ) : (
                    /* Gradient fallback when no image */
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at center, 
                ${currentScene % 2 === 0
                                    ? 'rgba(77,0,38,0.9), rgba(26,0,17,1)'
                                    : 'rgba(45,10,30,0.9), rgba(13,0,21,1)'}
              )`,
                        }}
                    />
                )}

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Bottom gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* ===== PROGRESS BAR ===== */}
            <div className="absolute top-0 left-0 right-0 z-30">
                <div className="h-[3px] bg-white/10">
                    <div
                        className="progress-bar h-full"
                        style={{ width: `${((currentScene + 1) / totalScenes) * 100}%` }}
                    />
                </div>
            </div>

            {/* ===== SCENE COUNTER ===== */}
            <div className="absolute top-5 right-5 z-30">
                <span className="text-white/30 text-xs font-light tracking-widest">
                    {String(currentScene + 1).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
                </span>
            </div>

            {/* ===== SCENE CONTENT ===== */}
            <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 md:px-12">

                {/* Scene title */}
                <div
                    className={`text-center mb-6 transition-all duration-1000 ease-out ${titleVisible && !isTransitioning
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        }`}
                >
                    <span className="text-5xl md:text-6xl block mb-4">{scene.emoji}</span>
                    <h3 className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-300/60 font-light">
                        {scene.title}
                    </h3>
                </div>

                {/* Scene story text */}
                <div
                    className={`text-center max-w-xl mx-auto transition-all duration-[1500ms] ease-out ${textVisible && !isTransitioning
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-6'
                        }`}
                >
                    {scene.text.split('\n').map((line, i) => (
                        <p
                            key={i}
                            className={`text-lg md:text-2xl lg:text-[1.7rem] font-light leading-relaxed md:leading-[2.2] text-white/90 mb-1
                ${line.startsWith("'") || line.startsWith("'") || line.startsWith('"')
                                    ? 'italic text-rose-200/90 font-normal'
                                    : ''
                                }`}
                            style={{
                                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                                transitionDelay: `${i * 150}ms`,
                            }}
                        >
                            {line || <span>&nbsp;</span>}
                        </p>
                    ))}
                </div>

                {/* Decorative line */}
                <div
                    className={`mt-8 w-16 h-[1px] bg-gradient-to-r from-transparent via-rose-400/40 to-transparent transition-all duration-1000 ${textVisible && !isTransitioning ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                        }`}
                />
            </div>

            {/* ===== CONTROLS ===== */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pb-8 px-6">
                {/* Gradient fade for controls area */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                <div className="relative flex items-center justify-center gap-3 md:gap-4 max-w-md mx-auto">
                    {/* Previous */}
                    <button
                        onClick={goPrev}
                        disabled={currentScene === 0}
                        className={`px-5 py-2.5 rounded-full text-sm font-light tracking-wide transition-all duration-300
              ${currentScene === 0
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md border border-white/10'
                            }`}
                    >
                        ←
                    </button>

                    {/* Auto-play toggle */}
                    <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`px-4 py-2.5 rounded-full text-xs tracking-wide transition-all duration-300 backdrop-blur-md border ${autoPlay
                                ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                                : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70 border-white/10'
                            }`}
                    >
                        {autoPlay ? '⏸' : '▶'}
                    </button>

                    {/* Next / Finish */}
                    <button
                        onClick={goNext}
                        className="btn-romantic px-8 py-2.5 text-sm font-light tracking-wide text-white glow-pink
                       hover:glow-pink-strong active:scale-95 transition-all duration-300"
                    >
                        {currentScene === totalScenes - 1 ? 'Finish ❤️' : 'Next →'}
                    </button>
                </div>
            </div>

            {/* ===== FLOATING SPARKLES ===== */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="sparkle-dot z-20"
                    style={{
                        top: `${15 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 4}s`,
                    }}
                />
            ))}

            {/* ===== SLOW ZOOM KEYFRAME (inline style) ===== */}
            <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>

            {/* ===== Background music placeholder ===== */}
            {/* 
        <audio autoPlay loop>
          <source src="/src/assets/music/background.mp3" type="audio/mpeg" />
        </audio>
      */}
        </div>
    );
}
