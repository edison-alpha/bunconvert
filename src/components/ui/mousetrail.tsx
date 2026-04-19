'use client';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageMouseTrailProps {
  children?: React.ReactNode;
  items: string[];
  maxNumberOfImages?: number;
  distance?: number;
  imgClass?: string;
  className?: string;
}

export default function ImageMouseTrail({
  children,
  items,
  maxNumberOfImages = 5,
  distance = 25,
  imgClass = 'w-40 h-48',
  className = '',
}: ImageMouseTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create image elements
    const imageElements: HTMLImageElement[] = [];
    for (let i = 0; i < maxNumberOfImages; i++) {
      const img = document.createElement('img');
      img.src = items[i % items.length];
      img.className = cn(
        'pointer-events-none fixed z-[5] rounded-xl object-cover opacity-0 transition-opacity duration-300',
        imgClass
      );
      img.dataset.status = 'inactive';
      img.style.left = '0px';
      img.style.top = '0px';
      container.appendChild(img);
      imageElements.push(img);
    }

    setImages(imageElements);

    return () => {
      imageElements.forEach((img) => container.removeChild(img));
    };
  }, [items, maxNumberOfImages, imgClass]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    const activate = (image: HTMLImageElement, x: number, y: number) => {
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.dataset.status = 'active';
      image.style.opacity = '1';

      setTimeout(() => {
        image.dataset.status = 'inactive';
        image.style.opacity = '0';
      }, 1000);
    };

    const distanceFromLast = (x: number, y: number) => {
      return Math.hypot(x - lastPositionRef.current.x, y - lastPositionRef.current.y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is over an interactive element
      const target = e.target as HTMLElement;
      const isOverInteractive = target.closest('button, a, input, select, textarea, [role="button"], .converter-card, .mobile-dock, .top-nav-compact, .top-nav-full, .mobile-top-pill');
      
      // Only activate trail if not over interactive elements
      if (!isOverInteractive && distanceFromLast(e.clientX, e.clientY) > distance) {
        const lead = images[currentIndexRef.current];
        lastPositionRef.current = { x: e.clientX, y: e.clientY };

        currentIndexRef.current = (currentIndexRef.current + 1) % images.length;

        activate(lead, e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [images, distance]);

  return (
    <div ref={containerRef} className={cn('pointer-events-none', className)}>
      {children}
    </div>
  );
}
