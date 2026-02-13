import { useState, useEffect } from 'react';
import FloatingPhotos from './FloatingPhotos';

export default function Transition({ onContinue }) {
    const [show, setShow] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShow(true), 500);
        const t2 = setTimeout(() => setShowButton(true), 2000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 screen-enter">
            <FloatingPhotos count={8} opacity={0.1} />
            {/* Background heart pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[200px] md:text-[300px] opacity-5 animate-heartbeat select-none">
                    ❤️
                </div>
            </div>

            {/* Content */}
            <div
                className={`relative z-10 text-center transition-all duration-[2000ms] ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="text-6xl mb-8 animate-bounce-in">😏</div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-glow bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                    You passed all my questions
                </h2>

                <p className="text-xl md:text-2xl text-rose-300/70 mb-2">❤️</p>

                <p className="text-base md:text-lg text-rose-200/50 italic mb-12">
                    I knew you would...
                </p>
            </div>

            {/* Continue button */}
            <div
                className={`relative z-10 transition-all duration-1000 ease-out ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                <button
                    onClick={onContinue}
                    className="btn-romantic px-10 py-4 text-lg md:text-xl text-white glow-pink
                     hover:glow-pink-strong active:scale-95 transition-all duration-300"
                >
                    I have something to tell you… 💫
                </button>
            </div>

            {/* Sparkles */}
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className="sparkle-dot"
                    style={{
                        top: `${10 + Math.random() * 80}%`,
                        left: `${5 + Math.random() * 90}%`,
                        animationDelay: `${Math.random() * 4}s`,
                    }}
                />
            ))}
        </div>
    );
}
