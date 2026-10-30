"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Satellite configuration
const SATELLITES = [
  { name: "WhatsApp", radius: 2.2, tiltX: 0.2, tiltZ: 0.1, speed: (2 * Math.PI) / 8, color: "#25D366" },
  { name: "Instagram", radius: 2.8, tiltX: -0.15, tiltZ: 0.3, speed: (2 * Math.PI) / 8, color: "#E1306C" },
  { name: "Website", radius: 3.4, tiltX: 0.3, tiltZ: -0.2, speed: (2 * Math.PI) / 8, color: "#8B5CF6" },
  { name: "Email", radius: 4.0, tiltX: -0.25, tiltZ: -0.1, speed: (2 * Math.PI) / 8, color: "#EA4335" },
  { name: "TikTok", radius: 4.6, tiltX: 0.4, tiltZ: 0.2, speed: (2 * Math.PI) / 8, color: "#00f2fe" }
];

function OrbitingNode({ radius, tiltX, tiltZ, speed, color }: typeof SATELLITES[0]) {
  const groupRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Mesh>(null);

  useFrame((state: any) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Rotate around Y-axis
      groupRef.current.rotation.y = elapsed * 0.15; // orbit speed
    }

    // Animate particle along the line from satellite to center (radius -> 0)
    if (particleRef.current) {
      const p = (elapsed * 0.3) % 1.0; // speed of particle flow
      particleRef.current.position.x = radius * (1 - p);
    }
  });

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      {/* Orbit Ring */}
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const angle = (i / 63) * 2 * Math.PI;
          return [radius * Math.cos(angle), 0, radius * Math.sin(angle)];
        })}
        color="rgba(255, 255, 255, 0.05)"
        lineWidth={1}
      />

      {/* Satellite Node */}
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Connection Line to Center */}
      <Line
        points={[[radius, 0, 0], [0, 0, 0]]}
        color={color}
        opacity={0.3}
        transparent
        lineWidth={1.5}
      />

      {/* Animated Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function CentralNode() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state: any) => {
    const elapsed = state.clock.getElapsedTime();
    // Pulse scale 1.0 to 1.15 on 2s loop (frequency = 0.5Hz, angular freq is PI)
    const scale = 1.0 + Math.sin(elapsed * Math.PI) * 0.075;
    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
    }
    if (lightRef.current) {
      lightRef.current.intensity = scale * 2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <pointLight ref={lightRef} color="#8B5CF6" distance={10} intensity={2} decay={2} />
    </group>
  );
}

function OutputNodes() {
  // Two output nodes below center with purple tint
  return (
    <group position={[0, -1.8, 0]}>
      {/* Node 1 */}
      <group position={[-1.2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={1}
          />
        </mesh>
        <Line points={[[0, 0, 0], [0, 1.8, 0]]} color="#8B5CF6" opacity={0.3} transparent lineWidth={1.5} />
      </group>

      {/* Node 2 */}
      <group position={[1.2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={1}
          />
        </mesh>
        <Line points={[[0, 0, 0], [0, 1.8, 0]]} color="#8B5CF6" opacity={0.3} transparent lineWidth={1.5} />
      </group>
    </group>
  );
}

function Scene() {
  const sceneGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (sceneGroupRef.current) {
      // Entire scene rotates on Y axis once every 60 seconds
      sceneGroupRef.current.rotation.y = elapsed * (2 * Math.PI / 60);
    }
  });

  return (
    <group ref={sceneGroupRef}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <CentralNode />
      
      {SATELLITES.map((sat) => (
        <OrbitingNode key={sat.name} {...sat} />
      ))}

      <OutputNodes />
    </group>
  );
}

export default function SignalPulse() {
  return (
    <div className="w-full h-[350px] md:h-[450px] relative z-10">
      <Canvas
        camera={{ position: [0, 2.0, 6.0], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
