import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxSection({ children, className = '', offset = 50 }) {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}
