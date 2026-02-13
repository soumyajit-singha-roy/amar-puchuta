import { useState, useEffect } from 'react';
import FloatingPhotos from './FloatingPhotos';

// Floating hearts background component
function FloatingHearts() {
    const hearts = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '🌹', '✨'];
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const initialHearts = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            emoji: hearts[Math.floor(Math.random() * hearts.length)],
            left: Math.random() * 100,
            delay: Math.random() * 8,
            duration: 6 + Math.random() * 8,
            size: 0.8 + Math.random() * 1.5,
        }));
        setParticles(initialHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((heart) => (
                <span
                    key={heart.id}
                    className="floating-heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDelay: `${heart.delay}s`,
                        animationDuration: `${heart.duration}s`,
                        fontSize: `${heart.size}rem`,
                    }}
                >
                    {heart.emoji}
                </span>
            ))}
        </div>
    );
}

export default function Welcome({ onStart }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 screen-enter">
            <FloatingPhotos count={10} opacity={0.12} />
            <FloatingHearts />

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

            <div
                className={`relative z-10 text-center transition-all duration-1000 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                {/* Hearts decoration */}
                <div className="text-6xl mb-6 animate-heartbeat">💕</div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 text-glow-strong bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Hey Mamma 💕
                </h1>

                <p className="text-xl md:text-3xl font-semibold mb-4 text-glow bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-300 bg-clip-text text-transparent">
                    My Personal Moon 🌙
                </p>

                <p className="text-lg md:text-2xl text-rose-200/80 mb-2 font-light">
                    ❤️ I made something special for you ❤️
                </p>

                <p className="text-sm md:text-base text-rose-300/50 mb-12 font-light italic">
                    — from Soumya, with all my love
                </p>

                {/* Start button */}
                <button
                    onClick={onStart}
                    className="btn-romantic px-10 py-4 text-lg md:text-xl text-white glow-pink-strong hover:animate-pulse-glow active:scale-95 transition-all duration-300"
                >
                    Start 💌
                </button>
            </div>

            {/* Bottom decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
    );
}
