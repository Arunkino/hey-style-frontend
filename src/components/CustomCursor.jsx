import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { damping: 25, stiffness: 200 });
    const springY = useSpring(cursorY, { damping: 25, stiffness: 200 });
    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on desktop
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handlePointerOver = (e) => {
            const target = e.target;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA'
            ) {
                setIsPointer(true);
            } else {
                setIsPointer(false);
            }
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
            <motion.div
                className="custom-cursor-dot"
                style={{
                    left: springX,
                    top: springY,
                    scale: isPointer ? 2.5 : 1,
                }}
            />
            <motion.div
                className="custom-cursor-ring"
                style={{
                    left: springX,
                    top: springY,
                    scale: isPointer ? 1.5 : 1,
                }}
            />
        </>
    );
}
