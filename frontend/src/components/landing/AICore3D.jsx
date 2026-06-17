import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';


// Helper to generate particle positions outside the render cycle to satisfy pure-render constraints
const generateParticlePositions = (count, radius) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Create a torus-like distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = radius + (Math.random() - 0.5) * 0.8;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Flattened Y to make a ring
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
};

// Particle system representing data streams around the core
const ParticleRing = ({ count = 1000, radius = 2.5 }) => {
  const points = useRef();

  const particlesPosition = useMemo(() => generateParticlePositions(count, radius), [count, radius]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.1;
      points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00D9FF" size={0.02} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
};

// The central AI brain
const CoreOrb = () => {
  const orbRef = useRef();

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={orbRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#8B5CF6"
          emissive="#00F5A0"
          emissiveIntensity={0.5}
          distort={0.4}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Inner solid core */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial color="#030712" emissive="#8B5CF6" emissiveIntensity={2} />
      </Sphere>
    </Float>
  );
};

// Orbiting intelligent nodes (satellites)
const OrbitingNodes = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 3;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.5, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
};

export const AICore3D = () => {
  return (
    <div className="w-full h-[600px] relative pointer-events-auto">
      {/* Ambient glow behind the canvas */}
      <div className="absolute inset-0 bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen scale-150 animate-pulse-glow" />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#00D9FF" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#8B5CF6" />
        
        <CoreOrb />
        <ParticleRing count={2000} radius={2.5} />
        <ParticleRing count={1000} radius={4} />
        <OrbitingNodes />
        
        {/* Allows user to drag and rotate the core */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 3} 
        />
      </Canvas>
    </div>
  );
};

export default AICore3D;
