import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    // Dot tracks mouse instantly (tight spring)
    const dotX = useMotionValue(-100);
    const dotY = useMotionValue(-100);
    const dotSpringX = useSpring(dotX, { damping: 40, stiffness: 700, mass: 0.3 });
    const dotSpringY = useSpring(dotY, { damping: 40, stiffness: 700, mass: 0.3 });

    // Ring lags slightly behind for elegance
    const ringX = useMotionValue(-100);
    const ringY = useMotionValue(-100);
    const ringSpringX = useSpring(ringX, { damping: 28, stiffness: 180, mass: 0.5 });
    const ringSpringY = useSpring(ringY, { damping: 28, stiffness: 180, mass: 0.5 });

    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const moveCursor = (e) => {
            dotX.set(e.clientX);
            dotY.set(e.clientY);
            ringX.set(e.clientX);
            ringY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handlePointerOver = (e) => {
            const target = e.target;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('button') ||
                target.closest('a');
            setIsPointer(!!isInteractive);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handlePointerOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handlePointerOver);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Inner dot — snappy, disappears on hover */}
            <motion.div
                className="custom-cursor-dot"
                style={{ left: dotSpringX, top: dotSpringY }}
                animate={{ scale: isPointer ? 0 : 1, opacity: isPointer ? 0 : 1 }}
                transition={{ duration: 0.15 }}
            />
            {/* Outer ring — elegant lag, expands on hover */}
            <motion.div
                className="custom-cursor-ring"
                style={{
                    left: ringSpringX,
                    top: ringSpringY,
                    background: isPointer ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderColor: isPointer ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                }}
                animate={{ scale: isPointer ? 1.6 : 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            />
        </>
    );
}
