import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

/* ── Color Palette ──────────────────────────────────────── */
const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  brand: '#60a5fa',
  brandDark: '#1e3a5f',
  accent: '#fbbf24',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  green: '#22c55e',
  terminal: '#0d1117',
};

/* ── Fonts ──────────────────────────────────────────────── */
const FONT = { family: 'Inter, system-ui, sans-serif', weight: 700 };
const FONT_MONO = { family: 'JetBrains Mono, Fira Code, monospace', weight: 400 };

/* ── Helpers ─────────────────────────────────────────────── */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const slideUp = (frame: number, start: number, duration: number = 15) => {
  const progress = Math.max(0, Math.min(1, (frame - start) / duration));
  return easeOut(progress);
};

/* ── Scene 1: Logo + Tagline ─────────────────────────────── */
const IntroScene: React.FC<{ frame: number }> = ({ frame }) => {
  const p = slideUp(frame, 0, 20);
  const subtitleP = slideUp(frame, 10, 15);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Logo mark */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 32 32"
        fill="none"
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
          marginBottom: 24,
        }}
      >
        <path
          d="M24 4C14.059 4 6 12.059 6 22C6 24.077 6.404 26.058 7.129 27.875C4.478 25.087 2.8 21.334 2.8 17.2C2.8 8.858 9.658 2 18 2C20.764 2 23.365 2.71 25.6 3.926C25.067 3.975 24.533 4 24 4Z"
          fill={COLORS.brand}
          opacity="0.6"
        />
        <path
          d="M28 8C19.163 8 12 15.163 12 24C12 25.846 12.336 27.612 12.946 29.25C10.676 26.876 9.2 23.588 9.2 20C9.2 12.82 15.02 7 22.2 7C24.533 7 26.733 7.588 28.667 8.617C28.222 8.784 28 8.784 28 8Z"
          fill={COLORS.brand}
        />
      </svg>

      {/* Title */}
      <h1
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.weight,
          fontSize: 64,
          color: COLORS.text,
          margin: 0,
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
          letterSpacing: '-0.03em',
        }}
      >
        Chukfi{' '}
        <span style={{ color: COLORS.brand }}>CMS</span>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: FONT.family,
          fontWeight: 400,
          fontSize: 24,
          color: COLORS.textMuted,
          marginTop: 16,
          opacity: subtitleP,
          transform: `translateY(${(1 - subtitleP) * 20}px)`,
        }}
      >
        Ship a CMS in 30 Seconds
      </p>
    </AbsoluteFill>
  );
};

/* ── Scene 2: Terminal ────────────────────────────────────── */
const TerminalLine: React.FC<{
  text: string;
  prompt?: string;
  isOutput?: boolean;
  delay: number;
  frame: number;
  speed?: number;
}> = ({ text, prompt = '$', isOutput = false, delay, frame, speed = 1 }) => {
  const chars = Math.max(0, Math.min(text.length, Math.floor((frame - delay) / speed)));
  const visible = frame >= delay;
  const p = slideUp(frame, delay, 8);

  if (!visible) return null;

  return (
    <div
      style={{
        fontFamily: FONT_MONO.family,
        fontSize: 20,
        color: isOutput ? COLORS.green : COLORS.text,
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
        lineHeight: 1.8,
        whiteSpace: 'pre',
      }}
    >
      {isOutput ? (
        <span>{text}</span>
      ) : (
        <>
          <span style={{ color: COLORS.green }}>{prompt}</span>{' '}
          <span>{text.slice(0, chars)}</span>
          {chars < text.length && (
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 22,
                backgroundColor: COLORS.text,
                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
                verticalAlign: 'text-bottom',
                marginLeft: 2,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

const TerminalScene: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Terminal window */}
      <div
        style={{
          width: 800,
          backgroundColor: COLORS.terminal,
          borderRadius: 12,
          border: `1px solid ${COLORS.surfaceLight}`,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 36,
            backgroundColor: COLORS.surface,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span
            style={{
              fontFamily: FONT_MONO.family,
              fontSize: 13,
              color: COLORS.textMuted,
              marginLeft: 16,
            }}
          >
            terminal — chukfi — 80×24
          </span>
        </div>

        {/* Terminal content */}
        <div style={{ padding: '20px 24px', minHeight: 280 }}>
          <TerminalLine
            text="npm install @chukfi/cli"
            frame={frame}
            delay={0}
            speed={3}
          />
          <TerminalLine
            text="+ @chukfi/cli@1.0.0"
            isOutput
            frame={frame}
            delay={45}
          />
          <TerminalLine
            text="added 1 package in 2s"
            isOutput
            frame={frame}
            delay={55}
          />
          <div style={{ height: 12 }} />
          <TerminalLine
            text="npx chukfi dev"
            frame={frame}
            delay={75}
            speed={3}
          />
          <TerminalLine
            text="✓ Docker detected (Docker Desktop)"
            isOutput
            frame={frame}
            delay={120}
          />
          <TerminalLine
            text="✓ PostgreSQL 17 started on port 5433"
            isOutput
            frame={frame}
            delay={130}
          />
          <TerminalLine
            text="✓ Migrations applied"
            isOutput
            frame={frame}
            delay={138}
          />
          <TerminalLine
            text="✓ Chukfi CMS running on http://localhost:8080"
            isOutput
            frame={frame}
            delay={146}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 3: Success / CTA ───────────────────────────────── */
const OutroScene: React.FC<{ frame: number }> = ({ frame }) => {
  const p = slideUp(frame, 0, 20);
  const urlP = slideUp(frame, 15, 15);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Checkmark */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: COLORS.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          opacity: p,
          transform: `scale(${p})`,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.weight,
          fontSize: 48,
          color: COLORS.text,
          margin: 0,
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        Your CMS is Live
      </h1>

      <p
        style={{
          fontFamily: FONT.family,
          fontWeight: 400,
          fontSize: 20,
          color: COLORS.textMuted,
          marginTop: 12,
          opacity: urlP,
          transform: `translateY(${(1 - urlP) * 15}px)`,
        }}
      >
        Ready at{' '}
        <span style={{ color: COLORS.brand, fontFamily: FONT_MONO.family }}>
          http://localhost:8080
        </span>
      </p>

      <p
        style={{
          fontFamily: FONT.family,
          fontWeight: 400,
          fontSize: 16,
          color: COLORS.textMuted,
          marginTop: 32,
          opacity: Math.max(0, urlP - 0.3),
        }}
      >
        chukfi.dev — Documentation
      </p>
    </AbsoluteFill>
  );
};

/* ── Main Composition ────────────────────────────────────── */
export const QuickStart: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Intro — frames 0-45 */}
      {frame < 45 && <IntroScene frame={frame} />}

      {/* Scene 2: Terminal — frames 45-130 */}
      {frame >= 40 && frame < 135 && (
        <div style={{ opacity: frame < 45 ? (frame - 40) / 5 : frame > 130 ? (135 - frame) / 5 : 1 }}>
          <TerminalScene frame={frame - 45} />
        </div>
      )}

      {/* Scene 3: Outro — frames 130-150 */}
      {frame >= 130 && <OutroScene frame={frame - 130} />}
    </AbsoluteFill>
  );
};
