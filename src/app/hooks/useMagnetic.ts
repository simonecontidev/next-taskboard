"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function useMagnetic(ref: React.RefObject<HTMLElement>, strength = 30) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    function handleMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(relX * relX + relY * relY);
      const limit = rect.width * 0.75;
      if (dist < limit) {
        const factor = 1 - dist / limit;
        xTo(relX * factor * 0.4);
        yTo(relY * factor * 0.4);
      }
    }

    function reset() {
      xTo(0);
      yTo(0);
    }

    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, [ref, strength]);
}