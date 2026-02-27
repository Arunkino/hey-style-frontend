import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!isInView) return;

        let start = 0;
        const increment = target / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);

        return () => clearInterval(timer);
    }, [isInView, target, duration]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
