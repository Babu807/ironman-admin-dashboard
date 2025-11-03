import React from "react";

export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="10" width="60" height="44" rx="8" fill="#111827" />
      <path d="M8 20 L32 6 L56 20 L50 54 H14 L8 20 Z" fill="#C53030" opacity="0.95"/>
      <path d="M16 28 L32 18 L48 28 L44 46 H20 L16 28 Z" fill="#D4AF37" opacity="0.95"/>
    </svg>
  );
}
