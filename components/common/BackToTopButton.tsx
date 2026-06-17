"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to 300px
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Go to top"
      className={`
        fixed bottom-6 right-6 z-50
        w-11 h-11 md:w-12 md:h-12
        rounded-full bg-(--bpa-navy) border border-white/10
        flex items-center justify-center
        text-white shadow-2xl shadow-black/40
        cursor-pointer group
        transition-all duration-500 ease-in-out
        hover:bg-(--bpa-green) hover:scale-110 hover:shadow-(--bpa-green)/20
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:ring-offset-2 focus:ring-offset-(--bpa-navy)
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
      `}
    >
      <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-(--bpa-green) opacity-0 group-hover:opacity-20 blur-md transition-opacity -z-10" />
    </button>
  );
}
