"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import * as THREE from "three";

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function CameraCraneMove() {
  const { camera, clock } = useThree();
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const duration = 10.0; // seconds
    const t = Math.min(elapsed / duration, 1);
    const k = easeInOutCubic(t);
    const start = new THREE.Vector3(0, 0.6, 6.0);
    const end = new THREE.Vector3(0, 1.7, 1.2);
    const pos = start.clone().lerp(end, k);
    camera.position.copy(pos);
    camera.lookAt(0, 1.7, 0);
  });
  return null;
}

function Shirt() {
  const materialRef = useRef();
  const geometryRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.06 },
      uWindDir: { value: new THREE.Vector2(1.0, 0.3).normalize() },
      uBaseColor: { value: new THREE.Color("#74a4ff") },
    }),
    []
  );

  const vertexShader = `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uWindDir;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      float wave = sin((p.x * 4.0 + p.y * 5.0) + uTime * 2.2) * 0.5
                 + sin((p.x * 2.2 - p.y * 3.1) + uTime * 1.6) * 0.5;
      float falloff = smoothstep(0.0, 1.0, uv.x); // anchored at shoulder (uv.x ~ 0)
      p += vec3(uWindDir.x, 0.0, uWindDir.y) * wave * uIntensity * falloff;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uBaseColor;
    varying vec2 vUv;
    void main() {
      // subtle fabric shading
      float shade = 0.85 + 0.15 * smoothstep(0.0, 1.0, vUv.y);
      gl_FragColor = vec4(uBaseColor * shade, 1.0);
    }
  `;

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh
      ref={geometryRef}
      position={[0, 1.5, 0.26]}
      rotation={[0, Math.PI, 0]}
      castShadow
    >
      <planeGeometry args={[0.8, 0.6, 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Person() {
  return (
    <group>
      {/* Legs */}
      <mesh position={[0.12, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#2b3d54" roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh position={[-0.12, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#2b3d54" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.9, 24]} />
        <meshStandardMaterial color="#8db8ff" roughness={0.85} metalness={0.0} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.32, 1.35, 0]} rotation={[0, 0, Math.PI * 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#f0c9a4" roughness={0.8} />
      </mesh>
      <mesh position={[-0.32, 1.35, 0]} rotation={[0, 0, -Math.PI * 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#f0c9a4" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#f0c9a4" roughness={0.7} />
      </mesh>
      {/* Subtle hair cap */}
      <mesh position={[0, 2.06, -0.02]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 24, 1, true]} />
        <meshStandardMaterial color="#2b2b2b" roughness={1.0} />
      </mesh>
      {/* Shirt cloth */}
      <Shirt />
    </group>
  );
}

function Rooftop() {
  return (
    <group>
      {/* Roof slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#cfd6df" roughness={0.95} />
      </mesh>
      {/* Low wall/edge */}
      <mesh position={[0, 0.5, -2.5]} castShadow>
        <boxGeometry args={[6, 1, 0.2]} />
        <meshStandardMaterial color="#c2cad3" roughness={0.95} />
      </mesh>
    </group>
  );
}

function SunAndLight() {
  const dirLight = useRef();
  return (
    <group>
      <hemisphereLight skyColor={"#b9e8ff"} groundColor={"#e7eef7"} intensity={0.6} />
      <directionalLight
        ref={dirLight}
        position={[5, 8, 2]}
        castShadow
        intensity={1.2}
        color={"#fff7e6"}
      />
    </group>
  );
}

export default function RooftopScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.6, 6], fov: 40, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Sky
        sunPosition={[5, 8, 2]}
        distance={450000}
        turbidity={5}
        rayleigh={2}
        mieCoefficient={0.003}
        mieDirectionalG={0.9}
        inclination={0.49}
        azimuth={0.25}
      />
      <SunAndLight />
      <Rooftop />
      <Person />
      <CameraCraneMove />
    </Canvas>
  );
}

