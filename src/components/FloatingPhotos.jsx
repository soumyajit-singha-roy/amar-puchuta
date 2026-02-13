import { useState, useEffect, useCallback } from 'react';

// Auto-load all images from assets/images/
const imageModules = import.meta.glob('../assets/images/*.(jpg|jpeg|png|webp)', { eager: true });
const allImages = Object.entries(imageModules).map(([, module]) => module.default);

// Ken Burns zoom directions for variety
const kenBurnsStyles = [
    { start: 'scale(1.0) translate(0%, 0%)', end: 'scale(1.15) translate(-2%, -1%)' },
    { start: 'scale(1.05) translate(1%, 0%)', end: 'scale(1.0) translate(-1%, 1%)' },
    { start: 'scale(1.0) translate(-1%, 1%)', end: 'scale(1.12) translate(1%, -1%)' },
    { start: 'scale(1.1) translate(0%, -1%)', end: 'scale(1.0) translate(-1%, 0%)' },
    { start: 'scale(1.0) translate(1%, 1%)', end: 'scale(1.1) translate(-2%, -2%)' },
];

/**
 * FloatingPhotos — Full-screen cinematic photo background
 * Beautiful Ken Burns transitions between couple photos
 * Love icons float on top
 */
export default function FloatingPhotos() {
    const [activeSlot, setActiveSlot] = useState(0); // 0 or 1 for crossfade
    const [indices, setIndices] = useState([0, 1]);
    const [kenBurnsIdx, setKenBurnsIdx] = useState([0, 1]);
    const [loveIcons, setLoveIcons] = useState([]);

    // Generate floating love icons once
    useEffect(() => {
        const icons = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '🌹', '✨', '💋', '🦋', '🌸', '💫', '🥰', '💐'];
        const items = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            icon: icons[i % icons.length],
            left: Math.random() * 95 + 2.5,
            delay: Math.random() * 14,
            duration: 8 + Math.random() * 14,
            size: 0.9 + Math.random() * 1.4,
        }));
        setLoveIcons(items);
    }, []);

    // Crossfade between photos every 6 seconds
    useEffect(() => {
        if (allImages.length < 2) return;

        const interval = setInterval(() => {
            setActiveSlot(prev => {
                const next = prev === 0 ? 1 : 0;
                // Prepare the NEXT image on the inactive slot
                setIndices(prevIndices => {
                    const updated = [...prevIndices];
                    updated[next] = (prevIndices[prev] + 1) % allImages.length;
                    return updated;
                });
                setKenBurnsIdx(prevKB => {
                    const updated = [...prevKB];
                    updated[next] = (prevKB[prev] + 1) % kenBurnsStyles.length;
                    return updated;
                });
                return next;
            });
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    // No images → just floating icons
    if (allImages.length === 0) {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {loveIcons.map((icon) => (
                    <span
                        key={icon.id}
                        className="floating-heart"
                        style={{
                            left: `${icon.left}%`,
                            animationDelay: `${icon.delay}s`,
                            animationDuration: `${icon.duration}s`,
                            fontSize: `${icon.size}rem`,
                        }}
                    >
                        {icon.icon}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

            {/* ===== Two photo layers for crossfade ===== */}
            {[0, 1].map(slot => {
                const isActive = activeSlot === slot;
                const img = allImages[indices[slot] % allImages.length];
                const kb = kenBurnsStyles[kenBurnsIdx[slot] % kenBurnsStyles.length];

                return (
                    <div
                        key={slot}
                        className="absolute inset-0"
                        style={{
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 2s ease-in-out',
                        }}
                    >
                        <img
                            src={img}
                            alt=""
                            className="absolute w-full h-full"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                transform: isActive ? kb.end : kb.start,
                                transition: isActive ? 'transform 6s ease-in-out' : 'none',
                            }}
                        />
                    </div>
                );
            })}

            {/* ===== Cinematic dark overlay ===== */}
            <div className="absolute inset-0 bg-black/55" />

            {/* ===== Gradient vignette for depth ===== */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(ellipse at center, transparent 30%, rgba(10,0,15,0.7) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)
          `,
                }}
            />

            {/* ===== Romantic color tint ===== */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(190,30,90,0.08), rgba(100,30,180,0.08))',
                    mixBlendMode: 'overlay',
                }}
            />

            {/* ===== FLOATING LOVE ICONS ===== */}
            {loveIcons.map((icon) => (
                <span
                    key={icon.id}
                    className="floating-heart"
                    style={{
                        left: `${icon.left}%`,
                        animationDelay: `${icon.delay}s`,
                        animationDuration: `${icon.duration}s`,
                        fontSize: `${icon.size}rem`,
                        opacity: 0.35,
                        zIndex: 5,
                    }}
                >
                    {icon.icon}
                </span>
            ))}
        </div>
    );
}
