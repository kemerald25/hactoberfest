"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RotatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Elegant multi-axis rotation
      meshRef.current.rotation.y = elapsed * 0.5;
      meshRef.current.rotation.x = elapsed * 0.3;
      meshRef.current.position.y = Math.sin(elapsed * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.9, 0.28, 32, 64]} />
      <meshPhysicalMaterial
        color="#8B5CF6"
        metalness={0.95}
        roughness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={1.0}
        transmission={0.25}
        thickness={1.0}
        ior={1.6}
      />
    </mesh>
  );
}

function RotatingCone() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Fluid tilt and spin
      meshRef.current.rotation.y = elapsed * 0.45;
      meshRef.current.rotation.x = 0.45; // fixed tilt to reveal refraction better
      meshRef.current.rotation.z = elapsed * 0.25;
      meshRef.current.position.y = Math.sin(elapsed * 1.8) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* 32 radial segments makes it a perfectly smooth cone */}
      <coneGeometry args={[0.95, 2.0, 32]} />
      <meshPhysicalMaterial
        color="#a78bfa"
        metalness={0.95}
        roughness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={1.0}
        transmission={0.35}
        thickness={1.2}
        ior={1.65}
      />
    </mesh>
  );
}

export function TorusCanvas() {
  return (
    <div className="w-full h-[180px] relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#8B5CF6" />
        <RotatingTorus />
      </Canvas>
    </div>
  );
}

export function ConeCanvas() {
  return (
    <div className="w-full h-[180px] relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#a78bfa" />
        <RotatingCone />
      </Canvas>
    </div>
  );
}
