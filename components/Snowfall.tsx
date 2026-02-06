import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Constant for the custom flake image URL
const CUSTOM_FLAKE_IMAGE = "/snowflake.png";

export const Snowfall = () => {
    // Subtle count for background flakes
    const flakeCount = 20;
    const [heroFlakes, setHeroFlakes] = useState<{ id: number; left: string; size: number }[]>([]);

    // Generate standard flakes using the custom image
    const standardFlakes = useMemo(() => Array.from({ length: flakeCount }).map((_, i) => ({
        id: i,
        size: Math.random() * 12 + 10, // 10px to 22px
        left: `${Math.random() * 100}%`,
        driftX: [0, (Math.random() * 60 - 30), (Math.random() * 100 - 50)],
        duration: Math.random() * 15 + 25, // Slow, graceful fall
        delay: Math.random() * -40,
        opacity: Math.random() * 0.2 + 0.1, // Very subtle for background
        rotation: Math.random() * 360,
    })), []);

    // Effect to drop a "Hero Flake" every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const newFlake = {
                id: Date.now(),
                left: `${Math.random() * 80 + 10}%`, // Keep centered
                size: Math.random() * 20 + 40, // Large: 40px to 60px
            };
            setHeroFlakes(prev => [...prev.slice(-3), newFlake]); // Keep fewer hero flakes in memory
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const FlakeImage = ({ size, opacity, brightness = "brightness-200" }: { size: number, opacity: number, brightness?: string }) => (
        <div style={{ width: size, height: size, opacity }}>
            <img
                src={CUSTOM_FLAKE_IMAGE}
                alt=""
                className={`w-full h-full object-contain ${brightness}`}
                onError={(e: any) => {
                    // Fallback to text icon if image loading fails
                    e.target.style.display = 'none';
                    const span = document.createElement('span');
                    span.style.color = 'white';
                    span.style.fontSize = '1.2em';
                    span.innerText = '❄';
                    e.target.parentElement.appendChild(span);
                }}
            />
        </div>
    );

    return (
        <div
            className="fixed inset-0 pointer-events-none select-none overflow-hidden"
            style={{ zIndex: 9999, width: '100vw', height: '100vh' }}
        >
            {/* Standard Background Flakes (Using Image) */}
            {standardFlakes.map((flake) => (
                <motion.div
                    key={`std-${flake.id}`}
                    initial={{ y: "-10vh", x: 0 }}
                    animate={{
                        y: "110vh",
                        x: flake.driftX,
                        rotate: flake.rotation
                    }}
                    transition={{ duration: flake.duration, repeat: Infinity, delay: flake.delay, ease: "linear" }}
                    className="absolute pointer-events-none"
                    style={{ left: flake.left }}
                >
                    <FlakeImage size={flake.size} opacity={flake.opacity} brightness="brightness-150" />
                </motion.div>
            ))}

            {/* Special Large Hero Flakes (Every 8s) */}
            <AnimatePresence>
                {heroFlakes.map((flake) => (
                    <motion.div
                        key={flake.id}
                        initial={{ opacity: 0, y: "-15vh", x: 0, rotate: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            y: "115vh",
                            x: [0, 80, -80, 40], // Dramatic sway
                            rotate: 720,
                            scale: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 20, ease: "linear" }}
                        className="absolute pointer-events-none"
                        style={{ left: flake.left }}
                    >
                        <FlakeImage size={flake.size} opacity={0.8} brightness="brightness-200" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
