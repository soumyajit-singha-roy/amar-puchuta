import { useState, useEffect, useRef, useCallback } from 'react';
import FloatingPhotos from './FloatingPhotos';

export default function QuestionStep({ question, noTexts, onNext, questionIndex, totalQuestions }) {
    const [noTextIndex, setNoTextIndex] = useState(0);
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [noScale, setNoScale] = useState(1);
    const [noRotation, setNoRotation] = useState(0);
    const [yesScale, setYesScale] = useState(1); // YES button grows when NO is hovered
    const [showQuestion, setShowQuestion] = useState(false);
    const [yesClicked, setYesClicked] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setShowQuestion(false);
        setNoTextIndex(0);
        setNoPosition({ x: 0, y: 0 });
        setNoScale(1);
        setNoRotation(0);
        setYesScale(1);
        setYesClicked(false);
        const timer = setTimeout(() => setShowQuestion(true), 200);
        return () => clearTimeout(timer);
    }, [question]);

    const moveNoButton = useCallback(() => {
        if (!containerRef.current) return;
        const container = containerRef.current.getBoundingClientRect();
        const maxX = Math.min(container.width * 0.6, 250);
        const maxY = Math.min(container.height * 0.3, 150);
        const newX = (Math.random() - 0.5) * 2 * maxX;
        const newY = (Math.random() - 0.5) * 2 * maxY;

        setNoPosition({ x: newX, y: newY });
        setNoScale(prev => Math.max(0.4, prev - 0.1));
        setNoRotation(prev => prev + (Math.random() > 0.5 ? 15 : -15));
        setNoTextIndex(prev => (prev + 1) % noTexts.length);
        // YES button grows each time NO is hovered!
        setYesScale(prev => Math.min(2, prev + 0.15));
    }, [noTexts.length]);

    const handleYes = () => {
        setYesClicked(true);
        setTimeout(() => onNext(), 600);
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center px-6 screen-enter"
        >
            {/* Progress indicator */}
            <FloatingPhotos count={8} opacity={0.08} />
            <div className="absolute top-6 left-6 right-6 z-20">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-rose-300/60 text-xs font-medium">
                        {questionIndex + 1} / {totalQuestions}
                    </span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="progress-bar h-full rounded-full"
                            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question */}
            <div
                className={`text-center mb-16 transition-all duration-700 ${showQuestion && !yesClicked
                    ? 'opacity-100 translate-y-0 scale-100'
                    : yesClicked
                        ? 'opacity-0 scale-110'
                        : 'opacity-0 translate-y-6 scale-95'
                    }`}
            >
                <div className="text-5xl mb-6 animate-bounce-in">
                    {questionIndex === totalQuestions - 1 ? '💍' : '💝'}
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-glow bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 bg-clip-text text-transparent leading-relaxed">
                    {question}
                </h2>
            </div>

            {/* Buttons */}
            <div
                className={`relative flex flex-col sm:flex-row items-center gap-6 transition-all duration-700 ${showQuestion && !yesClicked ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* YES Button — grows when NO is hovered! */}
                <button
                    onClick={handleYes}
                    className="btn-romantic px-12 py-4 text-lg md:text-xl text-white glow-pink-strong
                     hover:animate-pulse-glow active:scale-95
                     transition-all duration-500 ease-out z-10 min-w-[160px]"
                    style={{
                        transform: `scale(${yesScale})`,
                    }}
                >
                    Yes! 💖
                </button>

                {/* NO Button — dodges on hover! */}
                <button
                    onMouseEnter={moveNoButton}
                    onTouchStart={moveNoButton}
                    className="px-8 py-3 text-sm md:text-base rounded-full border border-white/20
                     bg-white/5 text-white/60 backdrop-blur-sm
                     transition-all duration-300 ease-out z-10 min-w-[140px]
                     hover:border-white/10"
                    style={{
                        transform: `translate(${noPosition.x}px, ${noPosition.y}px) scale(${noScale}) rotate(${noRotation}deg)`,
                        opacity: Math.max(0.3, noScale),
                    }}
                >
                    {noTexts[noTextIndex]}
                </button>
            </div>

            {/* Floating sparkles */}
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="sparkle-dot"
                    style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${15 + Math.random() * 70}%`,
                        animationDelay: `${Math.random() * 3}s`,
                    }}
                />
            ))}
        </div>
    );
}
