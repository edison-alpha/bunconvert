import React, { useRef } from 'react';
import { AnimatedBeam, Circle, Icons } from './ui/animated-beam';

interface ConversionBeamLoaderProps {
  progress: number;
  fileCount: number;
  fileNames: string[];
}

export default function ConversionBeamLoader({ progress, fileCount, fileNames }: ConversionBeamLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const visibleNames = fileNames.slice(0, 3);

  return (
    <div className="py-4 sm:py-5">
      <div className="mx-auto flex w-full max-w-[500px] flex-col items-center">
        <div
          className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[28px] border border-slate-200/90 bg-neutral-50/95 p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-4 lg:p-10"
          ref={containerRef}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_65%)]" />
          <div className="relative flex h-full w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row items-center justify-between">
              <Circle ref={sourceRef} className="h-12 w-12 sm:h-14 sm:w-14">
                <Icons.user />
              </Circle>
              <div ref={targetRef} className="z-10 flex items-center justify-center">
                <img
                  src="/brand.png"
                  alt="BUNCONVERT"
                  className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
                />
              </div>
            </div>
          </div>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={sourceRef}
            toRef={targetRef}
            startYOffset={10}
            endYOffset={10}
            curvature={-20}
            dotted
            dotSpacing={7}
            pathOpacity={0.16}
            duration={4.8}
            delay={0.2}
            gradientStartColor="#2563EB"
            gradientStopColor="#60A5FA"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={sourceRef}
            toRef={targetRef}
            startYOffset={-10}
            endYOffset={-10}
            curvature={20}
            reverse
            dotted
            dotSpacing={7}
            pathOpacity={0.16}
            duration={4.5}
            delay={0.5}
            gradientStartColor="#1E40AF"
            gradientStopColor="#93C5FD"
          />
        </div>

        <div className="mt-5 w-full rounded-[24px] border border-slate-200/80 bg-white/65 px-4 py-4 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-slate-500 sm:text-[13px]">
            <span>Converting {fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
            <span className="text-[#1E40AF]">{progress}% completed</span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#22C55E] shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibleNames.map((name) => (
              <span
                key={name}
                className="max-w-full truncate rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-slate-600 sm:text-[12px]"
              >
                {name}
              </span>
            ))}

            {fileCount > visibleNames.length && (
              <span className="rounded-full border border-dashed border-slate-300 bg-white/40 px-3 py-1.5 text-[11px] font-semibold text-[#1E40AF] sm:text-[12px]">
                +{fileCount - visibleNames.length} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
