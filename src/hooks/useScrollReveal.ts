import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;      // 0-1, how much of element must be visible
  rootMargin?: string;     // e.g. '0px 0px -60px 0px'
  once?: boolean;          // animate only once (default: true)
}

/**
 * Returns a ref to attach to a DOM element and an `isVisible` boolean.
 * When the element enters the viewport, isVisible becomes true.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  once = true,
}: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
