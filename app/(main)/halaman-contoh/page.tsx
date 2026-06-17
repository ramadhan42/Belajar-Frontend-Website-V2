"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";

export default function Page3D() {
  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-4xl font-bold mb-10 z-10 absolute top-20">
        Kubus 3D Stabil
      </h1>
      
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Pencahayaan agar kubus terlihat dimensinya */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Kubus yang stabil */}
        <Box args={[2, 2, 2]}>
          {/* Menggunakan MeshStandardMaterial untuk bentuk yang tetap */}
          <meshStandardMaterial 
            color="#2B92DE" 
            metalness={0.4} 
            roughness={0.3} 
          />
        </Box>

        {/* Kontrol */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}