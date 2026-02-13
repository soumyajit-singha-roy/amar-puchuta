import { useState, useEffect } from 'react';
import FloatingPhotos from './FloatingPhotos';

// Auto-load all images from assets/images/
const imageModules = import.meta.glob('../assets/images/*.(jpg|jpeg|png|webp)', { eager: true });

function getAllImages() {
    return Object.entries(imageModules).map(([path, module]) => ({
        src: module.default,
        name: path.split('/').pop(),
    }));
}

// Confetti component
function Confetti() {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        const colors = [
            '#e11d48', '#f43f5e', '#ec4899', '#d946ef',
            '#a855f7', '#fb7185', '#fda4af', '#f9a8d4',
            '#c084fc', '#fbbf24', '#34d399',
        ];
        const shapes = ['■', '●', '▲', '★', '❤', '♦'];

        const initialPieces = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            delay: Math.random() * 3,
            duration: 2.5 + Math.random() * 3,
            size: 8 + Math.random() * 12,
        }));
        setPieces(initialPieces);

        const interval = setInterval(() => {
            setPieces(prev =>
                prev.map(p => ({
                    ...p,
                    left: Math.random() * 100,
                    delay: Math.random() * 2,
                    duration: 2.5 + Math.random() * 3,
                }))
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.left}%`,
                        color: piece.color,
                        fontSize: `${piece.size}px`,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                    }}
                >
                    {piece.shape}
                </div>
            ))}
        </div>
    );
}

// Floating celebration hearts
function CelebrationHearts() {
    const hearts = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '🌹', '✨', '💐', '🦋'];
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const initialHearts = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            emoji: hearts[Math.floor(Math.random() * hearts.length)],
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: 5 + Math.random() * 10,
            size: 1 + Math.random() * 2,
        }));
        setParticles(initialHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {particles.map((heart) => (
                <span
                    key={heart.id}
                    className="floating-heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDelay: `${heart.delay}s`,
                        animationDuration: `${heart.duration}s`,
                        fontSize: `${heart.size}rem`,
                        opacity: 0.25,
                    }}
                >
                    {heart.emoji}
                </span>
            ))}
        </div>
    );
}

// Image Gallery — automatically picks up all photos from src/assets/images/
function ImageGallery() {
    const images = getAllImages();

    // Fallback placeholders if no images yet
    const placeholders = [
        { emoji: '💑', caption: 'Our first photo' },
        { emoji: '🌅', caption: 'That sunset' },
        { emoji: '🎉', caption: 'Celebrating us' },
        { emoji: '🥰', caption: 'My favorite moment' },
        { emoji: '📸', caption: 'Memories' },
        { emoji: '💖', caption: 'Us, always' },
    ];

    // Romantic captions for each photo
    const romanticCaptions = [
        'My favorite smile 🥰',
        'Us, together 💕',
        'My world ❤️',
        'Best moment ever ✨',
        'You & me 💖',
        'Forever mine 🌹',
        'My happiness 💗',
        'Our love story 💫',
        'Always & forever 💘',
    ];

    const galleryItems = images.length > 0
        ? images.map((img, i) => ({ src: img.src, caption: romanticCaptions[i % romanticCaptions.length] }))
        : placeholders;

    return (
        <div className="w-full max-w-2xl mx-auto mt-10">
            <h3 className="text-xl md:text-2xl font-semibold text-center mb-6 text-rose-200/80">
                Our Moments Together 💕
            </h3>
            <div className={`grid ${galleryItems.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-3 md:gap-4`}>
                {galleryItems.map((item, i) => (
                    <div
                        key={i}
                        className="relative group aspect-square rounded-2xl overflow-hidden
                       bg-white/5 border border-white/10 backdrop-blur-sm
                       hover:border-rose-400/30 hover:bg-white/10
                       transition-all duration-500 hover:scale-105 cursor-pointer"
                    >
                        {item.src ? (
                            <>
                                <img
                                    src={item.src}
                                    alt={item.caption}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Hover overlay with caption */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                flex items-end p-3">
                                    <span className="text-xs text-white/90 font-light">{item.caption}</span>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                <span className="text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {item.emoji}
                                </span>
                                <span className="text-[10px] md:text-xs text-rose-300/40 text-center italic">
                                    {item.caption}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <p className="text-rose-300/30 text-xs mt-4 text-center italic">
                    💡 Drop your photos in src/assets/images/ — they&apos;ll appear here automatically!
                </p>
            )}
        </div>
    );
}

export default function Finale() {
    const [show, setShow] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [showExtras, setShowExtras] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShow(true), 500);
        const t2 = setTimeout(() => setShowHeart(true), 1200);
        const t3 = setTimeout(() => setShowExtras(true), 2500);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden bg-romantic">
            <Confetti />
            <CelebrationHearts />
            <FloatingPhotos count={14} opacity={0.1} />

            {/* Giant "Mamma" watermark background text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                <span
                    className="text-[150px] sm:text-[220px] md:text-[300px] lg:text-[400px] font-extrabold uppercase tracking-widest"
                    style={{
                        background: 'linear-gradient(180deg, rgba(244,63,94,0.08) 0%, rgba(168,85,247,0.05) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                    }}
                >
                    Mamma
                </span>
            </div>

            {/* Central glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(244,63,94,0.6), rgba(168,85,247,0.3), transparent 70%)',
                    }}
                />
            </div>

            {/* Big glowing heart */}
            <div
                className={`relative z-20 transition-all duration-[2000ms] ease-out ${showHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
            >
                <div className="text-[120px] md:text-[180px] animate-heartbeat heart-glow select-none">
                    ❤️
                </div>
            </div>

            {/* Main text */}
            <div
                className={`relative z-20 text-center mt-2 transition-all duration-[1500ms] ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-3 text-glow-strong bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Happy Valentine&apos;s Day
                </h1>

                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-glow bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-300 bg-clip-text text-transparent">
                    Moon 🌙
                </h2>

                <p className="text-lg md:text-2xl text-rose-300/70 font-medium mb-6">
                    (My Mamma)
                </p>

                <p className="text-xl md:text-2xl text-rose-200/70 font-light mb-2">
                    You are my desire that I beg for 💕
                </p>

                <p className="text-base md:text-lg text-rose-300/50 italic mb-1">
                    Not things that I can buy — just you, always you ❤️
                </p>

                <div className="text-3xl mt-4 animate-bounce-in">
                    🥰
                </div>
            </div>

            {/* Gallery & extras */}
            <div
                className={`relative z-20 w-full transition-all duration-1000 ease-out ${showExtras ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
            >
                {/* Image Gallery */}
                <ImageGallery />

                {/* Wishing card */}
                <div className="max-w-lg mx-auto mt-12 p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                    <p className="text-2xl md:text-3xl font-semibold text-pink-300 mb-4">Mamma 💕</p>
                    <p className="text-lg md:text-xl text-rose-200/80 font-light leading-relaxed mb-4">
                        Meri pyaari <span className="font-semibold text-pink-300">Moon</span>,
                        <br />
                        tum meri zindagi ki sabse khoobsurat cheez ho.
                        <br />
                        Tumhare bina main adhoora hoon.
                        <br />
                        Happy Valentine&apos;s Day, mamma! 💝
                    </p>
                    <p className="text-base md:text-lg text-rose-100/60 italic leading-relaxed mb-4">
                        You are my desire that I beg for,
                        <br />
                        not things that I can buy.
                    </p>
                    <p className="text-rose-300/60 text-sm italic">
                        — tumhara <span className="font-semibold text-rose-300">Soumya</span> 💌
                    </p>
                    <p className="text-rose-400/40 text-xs mt-2">
                        Amar puchuutaa ❤️
                    </p>
                </div>

                <p className="text-rose-300/30 text-sm text-center mt-8 italic">
                    — forever yours, always & forever —
                </p>
            </div>

            {/* Sparkles */}
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={i}
                    className="sparkle-dot"
                    style={{
                        top: `${5 + Math.random() * 90}%`,
                        left: `${5 + Math.random() * 90}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        width: `${3 + Math.random() * 4}px`,
                        height: `${3 + Math.random() * 4}px`,
                    }}
                />
            ))}
        </div>
    );
}
