import React from 'react';
import { motion } from 'framer-motion';

const textRevealVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.02,
        },
    },
};

const charVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
    },
};

export default function TextReveal({ text, className = '', tag = 'h1' }) {
    const chars = text.split('');
    const Tag = motion[tag] || motion.h1;

    return (
        <Tag
            className={className}
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
        >
            {chars.map((char, i) => (
                <motion.span
                    key={i}
                    variants={charVariants}
                    style={{
                        display: 'inline-block',
                        whiteSpace: char === ' ' ? 'pre' : 'normal',
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </Tag>
    );
}
