/**
 * LandingPage3D.tsx — Hazo Lova Blockchain Edition
 */

import { useNavigate } from 'react-router-dom';
import { useRef, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const BRAND = {
  teal: "#0f766e",
  accent: "#0d9488",
  bg: "#f8fafc",
  card: "rgba(255, 255, 255, 0.7)",
  text: "#0f172a",
  muted: "#64748b",
};

const glassStyle = {
  background: BRAND.card,
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
};

function buildGraph() {
  const nodes: any[] = [];
  const edges: any[] = [];
  nodes.push({ id: 0, position: new THREE.Vector3(0, 0, 0) });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    nodes.push({
      id: nodes.length,
      position: new THREE.Vector3(
        Math.cos(angle) * 2.5,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * 2.5,
      ),
    });
    edges.push({ from: 0, to: nodes.length - 1 });
  }
  return { nodes, edges };
}

function Scene() {
  const { nodes, edges } = useMemo(buildGraph, []);
  return (
    <>
      <ambientLight intensity={0.6} />
      {edges.map((e, i) => (
        <Line
          key={i}
          points={[nodes[e.from].position, nodes[e.to].position]}
          color="#0d9488"
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      ))}
      {nodes.map((n) => (
        <mesh key={n.id} position={n.position} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color={n.id === 0 ? BRAND.teal : BRAND.accent}
            wireframe
          />
        </mesh>
      ))}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function LandingPage3D() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: BRAND.bg,
        minHeight: "100vh",
        color: BRAND.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#0d9488 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.05,
        }}
      />

      <div style={{ position: "relative", height: "100vh" }}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 45 }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>

        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "2rem 4rem",
            display: "flex",
            justifyContent: "space-between",
            zIndex: 10,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            HAZO<span style={{ color: BRAND.teal }}>LOVA</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <span onClick={() => navigate('/explorer')} style={{ cursor: 'pointer', fontWeight: 600 }}>Registre</span>
            <span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', fontWeight: 600 }}>Connexion</span>
            <button
              style={{
                padding: "0.8rem 1.5rem",
                background: BRAND.text,
                color: "#fff",
                borderRadius: "50px",
                border: "none",
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ACCÈS BETA
            </button>
          </div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            top: "35%",
            left: "8%",
            maxWidth: 500,
            zIndex: 10,
            ...glassStyle,
            padding: "3rem",
          }}
        >
          <span
            style={{
              color: BRAND.accent,
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Blockchain Infrastructure
          </span>
          <h1
            style={{
              fontSize: "4rem",
              lineHeight: 1,
              margin: "1.2rem 0",
              fontWeight: 800,
            }}
          >
            Infrastructure
            <br />
            Décentralisé.
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: BRAND.muted,
              marginBottom: "2.5rem",
            }}
          >
            Ancrage immuable des données foncières, agricoles et éducatives sur
            réseau distribué.
          </p>
          <button
            onClick={() => navigate('/explorer')}
            style={{
              padding: "1.1rem 2.5rem",
              background: BRAND.accent,
              color: "#fff",
              borderRadius: "12px",
              border: "none",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Explorer le registre
          </button>
        </motion.div>
      </div>
    </div>
  );
}
