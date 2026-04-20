import React, { useRef } from 'react';
import { AnimatedBeam, Circle, Icons } from './ui/animated-beam';

interface ConversionBeamLoaderProps {
  progress: number;
  fileCount: number;
  fileNames: string[];
  isDarkMode?: boolean;
  userAvatar?: string;
}

export default function ConversionBeamLoader({
  progress,
  fileCount,
  fileNames,
  isDarkMode = false,
  userAvatar
}: ConversionBeamLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const visibleNames = fileNames.slice(0, 3);

  return (
    <div className="py-4 sm:py-5">
      <div className="mx-auto flex w-full max-w-[500px] flex-col items-center">
        <div
          className={`relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[28px] border p-2 backdrop-blur-xl sm:p-4 lg:p-10 ${
            isDarkMode
              ? 'border-slate-700/75 bg-slate-900/88 shadow-[0_26px_60px_-30px_rgba(2,6,23,0.85)]'
              : 'border-slate-200/90 bg-neutral-50/95 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]'
          }`}
          ref={containerRef}
        >
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_72%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_65%)]'
            }`}
          />
          <div className="relative flex h-full w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row items-center justify-between">
              {userAvatar ? (
                <div ref={sourceRef} className="z-10 flex items-center justify-center">
                  <img
                    src={userAvatar}
                    alt="User Profile"
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shadow-lg"
                  />
                </div>
              ) : (
                <Circle
                  ref={sourceRef}
                  className={`h-12 w-12 sm:h-14 sm:w-14 ${
                    isDarkMode
                      ? 'border-slate-700/90 bg-slate-900 text-slate-100 shadow-[0_0_24px_-14px_rgba(59,130,246,0.55)]'
                      : ''
                  }`}
                >
                  <Icons.user />
                </Circle>
              )}
              <div ref={targetRef} className="z-10 flex items-center justify-center">
                <img
                  src="/animate.webp"
                  alt="BUNCONVERT"
                  className={`h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24 ${
                    isDarkMode ? 'ring-2 ring-slate-700/85' : ''
                  }`}
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
            pathOpacity={isDarkMode ? 0.28 : 0.16}
            duration={4.8}
            delay={0.2}
            pathColor={isDarkMode ? '#64748B' : '#94A3B8'}
            gradientStartColor={isDarkMode ? '#3B82F6' : '#2563EB'}
            gradientStopColor={isDarkMode ? '#93C5FD' : '#60A5FA'}
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
            pathOpacity={isDarkMode ? 0.28 : 0.16}
            duration={4.5}
            delay={0.5}
            pathColor={isDarkMode ? '#64748B' : '#94A3B8'}
            gradientStartColor={isDarkMode ? '#1D4ED8' : '#1E40AF'}
            gradientStopColor={isDarkMode ? '#BFDBFE' : '#93C5FD'}
          />
        </div>

        <div
          className={`mt-5 w-full rounded-[24px] border px-4 py-4 backdrop-blur-xl ${
            isDarkMode
              ? 'border-slate-700/75 bg-slate-900/62 shadow-[0_20px_44px_-28px_rgba(2,6,23,0.7)]'
              : 'border-slate-200/80 bg-white/65 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 text-[12px] font-semibold sm:text-[13px] ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            <span>Converting {fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
            <span className={isDarkMode ? 'text-blue-300' : 'text-[#1E40AF]'}>{progress}% completed</span>
          </div>

          <div className={`mt-2 h-2.5 overflow-hidden rounded-full ${isDarkMode ? 'bg-slate-700/70' : 'bg-slate-200/70'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#22C55E] shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibleNames.map((name) => (
              <span
                key={name}
                className={`max-w-full truncate rounded-full border px-3 py-1.5 text-[11px] font-medium sm:text-[12px] ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800/72 text-slate-200'
                    : 'border-slate-200 bg-white/70 text-slate-600'
                }`}
              >
                {name}
              </span>
            ))}

            {fileCount > visibleNames.length && (
              <span
                className={`rounded-full border border-dashed px-3 py-1.5 text-[11px] font-semibold sm:text-[12px] ${
                  isDarkMode
                    ? 'border-slate-600 bg-slate-800/55 text-blue-300'
                    : 'border-slate-300 bg-white/40 text-[#1E40AF]'
                }`}
              >
                +{fileCount - visibleNames.length} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
