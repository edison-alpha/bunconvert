import React, { forwardRef, type RefObject, useEffect, useId, useState } from 'react';
import { motion } from 'motion/react';
import { Archive, File, Image as ImageIcon, Music, RefreshCw, Sparkles, User, Video } from 'lucide-react';

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const Icons = {
  user: () => <User className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  image: () => <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  video: () => <Video className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  music: () => <Music className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  archive: () => <Archive className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  file: () => <File className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  boost: () => <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />,
  logo: () => <RefreshCw className="h-6 w-6 animate-spin sm:h-7 sm:w-7" strokeWidth={2.3} />
};

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  dotted?: boolean;
  dotSpacing?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = '#94A3B8',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = '#4d40ff',
  gradientStopColor = '#4043ff',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  dotted = false,
  dotSpacing = 6
}: AnimatedBeamProps) {
  const id = useId().replace(/:/g, '');
  const [pathD, setPathD] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const strokeDasharray = dotted ? `${dotSpacing} ${dotSpacing}` : undefined;

  const gradientCoordinates = reverse
    ? {
        x1: ['90%', '-10%'],
        x2: ['100%', '0%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%']
      }
    : {
        x1: ['10%', '110%'],
        x2: ['0%', '100%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%']
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updatePath()) : null;

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    if (fromRef.current) {
      resizeObserver?.observe(fromRef.current);
    }

    if (toRef.current) {
      resizeObserver?.observe(toRef.current);
    }

    window.addEventListener('resize', updatePath);
    updatePath();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePath);
    };
  }, [containerRef, curvature, endXOffset, endYOffset, fromRef, startXOffset, startYOffset, toRef]);

  if (!pathD || !svgDimensions.width || !svgDimensions.height) {
    return null;
  }

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none absolute left-0 top-0 transform-gpu stroke-2', className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      aria-hidden="true"
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
      />
      <motion.path
        d={pathD}
        stroke={`url(#${id})`}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        initial={{
          strokeWidth: pathWidth,
          strokeOpacity: 0
        }}
        animate={{
          strokeWidth: pathWidth * 1.5,
          strokeOpacity: 1
        }}
        transition={{
          duration: 2,
          delay
        }}
        style={{ filter: `drop-shadow(0 0 10px ${gradientStopColor}55)` }}
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: '0%',
            x2: '0%',
            y1: '0%',
            y2: '0%'
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

export const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/90 bg-white p-3 text-slate-900 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:h-14 sm:w-14',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Circle.displayName = 'Circle';
