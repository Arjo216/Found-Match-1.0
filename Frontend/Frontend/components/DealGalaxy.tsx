"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float, Line, Icosahedron, Sphere, Ring } from "@react-three/drei";
import * as THREE from "three";

interface Match {
  id: string;
  name: string;
  pitch_summary: string;
  similarity: number;
}

interface DealGalaxyProps {
  matches: Match[];
}

// --- ORBITAL RADAR RINGS ---
// Creates the spatial grid so investors understand the proximity
const RadarRings = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Ring args={[4.95, 5, 64]} material-color="#10b981" material-transparent material-opacity={0.15} />
      <Ring args={[9.95, 10, 64]} material-color="#06b6d4" material-transparent material-opacity={0.1} />
      <Ring args={[14.95, 15, 64]} material-color="#334155" material-transparent material-opacity={0.3} />
    </group>
  );
};

// --- INDIVIDUAL STARTUP NODE ---
const StartupNode = ({ match }: { match: Match }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Advanced Math: Map similarity (0-1) to an orbital distance (3 to 18 units)
  // High similarity (0.9+) puts them in the inner 5-unit ring.
  const position = useMemo(() => {
    const distance = Math.max(3, (1 - match.similarity) * 18);
    const phi = Math.acos(-1 + (2 * Math.random()));
    const theta = Math.sqrt(distance * Math.PI) * phi;
    
    return new THREE.Vector3(
      distance * Math.cos(theta) * Math.sin(phi),
      Math.abs(distance * Math.sin(theta) * Math.sin(phi)) * 0.5, // Keep them relatively flat on the Y axis
      distance * Math.cos(phi)
    );
  }, [match.similarity]);

  // Color mapping based on match quality
  const nodeColor = match.similarity > 0.8 ? "#10b981" : match.similarity > 0.5 ? "#0ea5e9" : "#64748b";
  const activeColor = "#38bdf8";

  return (
    <group>
      {/* Laser Tether connecting node to the center */}
      <Line 
        points={[[0, 0, 0], position.toArray()]} 
        color={hovered ? activeColor : nodeColor}
        transparent
        opacity={hovered ? 0.6 : 0.15}
        lineWidth={hovered ? 2 : 1}
      />

      {/* Physics Wrapper for natural drifting */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={position}>
        <Icosahedron 
          ref={meshRef} 
          args={[hovered ? 0.45 : 0.35, 1]} 
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHover(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
            setHover(false);
          }}
          onClick={() => alert(`Selected Founder: ${match.name}\nMatch Score: ${(match.similarity * 100).toFixed(1)}%\n\nPitch: ${match.pitch_summary}`)}
        >
          {/* Wireframe outer shell + glowing inner core */}
          <meshStandardMaterial 
            color={hovered ? activeColor : nodeColor}
            emissive={hovered ? activeColor : nodeColor}
            emissiveIntensity={hovered ? 2 : 0.8}
            wireframe={!hovered}
          />
        </Icosahedron>
        
        {/* Next-Gen Glassmorphism Labels */}
        {hovered && (
          <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center justify-center pointer-events-none transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-xl border border-white/20 rounded-t-lg text-white text-sm font-bold tracking-wide whitespace-nowrap shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                {match.name}
              </div>
              <div className={`px-3 py-1 w-full text-center border-x border-b border-white/20 rounded-b-lg text-xs font-mono font-black ${match.similarity > 0.8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {(match.similarity * 100).toFixed(1)}% MATCH
              </div>
              {/* UI Pointer Triangle */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/20"></div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

// --- MAIN SCENE EXPORT ---
export default function DealGalaxy({ matches }: DealGalaxyProps) {
  // A ref to slowly rotate the entire galaxy even when the user isn't touching it
  const galaxyRef = useRef<THREE.Group>(null);

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative">
      
      {/* Cyberpunk HUD Overlay */}
      <div className="absolute top-6 left-6 z-10 font-mono text-sm pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-white font-black tracking-widest uppercase">Semantic Grid Active</span>
        </div>
        <div className="space-y-1 text-slate-400 text-xs bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 inline-block">
          <p><span className="text-slate-500">Entities Found:</span> <span className="text-cyan-400 font-bold">{matches.length}</span></p>
          <p><span className="text-slate-500">Vector Math:</span> <span className="text-emerald-400">Cosine Similarity (384d)</span></p>
          <p className="mt-2 text-slate-600 pt-2 border-t border-white/5">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 20], fov: 50 }}>
        {/* Depth Fog - fades distant nodes into the background */}
        <fog attach="fog" args={["#020617", 10, 40]} />
        
        <Suspense fallback={null}>
          <color attach="background" args={["#020617"]} /> {/* slate-950 equivalent */}
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#38bdf8" />
          
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={1} fade speed={0.5} />
          
          {/* Group wrapper for global rotation */}
          <group ref={galaxyRef}>
            <RadarRings />
            
            {/* The Investor (Center) */}
            <Float speed={2} rotationIntensity={0} floatIntensity={1}>
              <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
              </Sphere>
              <Html position={[0, 1.2, 0]} center zIndexRange={[90, 0]}>
                <div className="text-amber-400 font-black tracking-widest text-xs pointer-events-none drop-shadow-[0_0_10px_rgba(251,191,36,1)] px-2 py-1 border border-amber-500/30 bg-amber-950/40 backdrop-blur-sm rounded">
                  INVESTOR THESIS
                </div>
              </Html>
            </Float>

            {matches.map((match) => (
              <StartupNode key={match.id} match={match} />
            ))}
          </group>

          {/* Silky smooth camera controls */}
          <OrbitControls 
            enablePan={false} 
            maxDistance={35} 
            minDistance={2} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5} // Prevents looking strictly from below
          />
        </Suspense>
      </Canvas>
    </div>
  );
}