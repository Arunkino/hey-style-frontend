import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';

function MascotPlane() {
    const meshRef = useRef();
    const texture = useTexture('/mascot.png');

    // Make background transparent
    texture.premultiplyAlpha = true;

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <mesh ref={meshRef}>
                    <planeGeometry args={[3.5, 3.5]} />
                    <meshBasicMaterial
                        map={texture}
                        transparent={true}
                        side={THREE.DoubleSide}
                        alphaTest={0.1}
                    />
                </mesh>
            </Billboard>
        </Float>
    );
}

function FloatingParticles() {
    const particlesRef = useRef();
    const count = 50;

    const positions = React.useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
            particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#8E6EE8"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function GlowOrbs() {
    const orb1 = useRef();
    const orb2 = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (orb1.current) {
            orb1.current.position.x = Math.sin(t * 0.4) * 2.5;
            orb1.current.position.y = Math.cos(t * 0.3) * 1.5;
        }
        if (orb2.current) {
            orb2.current.position.x = Math.cos(t * 0.35) * 2;
            orb2.current.position.y = Math.sin(t * 0.45) * 1.8;
        }
    });

    return (
        <>
            <mesh ref={orb1} position={[2, 1, -2]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#8E6EE8" transparent opacity={0.15} />
            </mesh>
            <mesh ref={orb2} position={[-2, -1, -1]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#E3DEFF" transparent opacity={0.12} />
            </mesh>
        </>
    );
}

export default function FloatingMascot({ className = '' }) {
    return (
        <div className={`${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} intensity={0.5} />
                <MascotPlane />
                <FloatingParticles />
                <GlowOrbs />
            </Canvas>
        </div>
    );
}
