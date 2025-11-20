"use client";

import RooftopScene from "../components/RooftopScene";

export default function HomePage() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "linear-gradient(#86c5ff, #e9f4ff 70%)",
      }}
    >
      <RooftopScene />
    </main>
  );
}

