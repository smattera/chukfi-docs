import { AbsoluteFill, useCurrentFrame } from 'remotion';

/* ── Color Palette ──────────────────────────────────────── */
const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  brand: '#60a5fa',
  accent: '#fbbf24',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  green: '#22c55e',
  terminal: '#0d1117',
};

const FONT = { family: 'Inter, system-ui, sans-serif', weight: 700 };
const FONT_MONO = { family: 'JetBrains Mono, Fira Code, monospace', weight: 400 };

/* ── Easing ──────────────────────────────────────────────── */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const slideUp = (frame: number, start: number, duration: number = 15) => {
  const progress = Math.max(0, Math.min(1, (frame - start) / duration));
  return easeOut(progress);
};

/* ── Scene 1: Full-Screen Logo + Tagline ─────────────────── */
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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Logo mark — large */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 32 32"
        fill="none"
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px) scale(${p})`,
          marginBottom: 32,
          filter: 'drop-shadow(0 0 30px rgba(96, 165, 250, 0.3))',
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

      {/* Title — huge */}
      <h1
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.weight,
          fontSize: 96,
          color: COLORS.text,
          margin: 0,
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px)`,
          letterSpacing: '-0.03em',
          textAlign: 'center',
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
          fontSize: 32,
          color: COLORS.textMuted,
          marginTop: 20,
          opacity: subtitleP,
          transform: `translateY(${(1 - subtitleP) * 25}px)`,
        }}
      >
        Ship a CMS in 30 Seconds
      </p>
    </AbsoluteFill>
  );
};

/* ── Scene 2: Full-Screen Terminal ────────────────────────── */
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
        fontSize: 28,
        color: isOutput ? COLORS.green : COLORS.text,
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
        lineHeight: 2.0,
        whiteSpace: 'pre',
        padding: '0 40px',
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
                width: 14,
                height: 30,
                backgroundColor: COLORS.text,
                opacity: Math.floor(frame / 5) % 2 === 0 ? 1 : 0,
                verticalAlign: 'text-bottom',
                marginLeft: 3,
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
        padding: 40,
      }}
    >
      {/* Terminal window — fills most of the screen */}
      <div
        style={{
          width: '100%',
          maxWidth: 1400,
          backgroundColor: COLORS.terminal,
          borderRadius: 16,
          border: `1px solid ${COLORS.surfaceLight}`,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 48,
            backgroundColor: COLORS.surface,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 10,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span
            style={{
              fontFamily: FONT_MONO.family,
              fontSize: 16,
              color: COLORS.textMuted,
              marginLeft: 20,
            }}
          >
            terminal — chukfi
          </span>
        </div>

        {/* Terminal content */}
        <div style={{ padding: '32px 0', minHeight: 420 }}>
          <TerminalLine
            text="npm install @chukfi/cli"
            frame={frame}
            delay={0}
            speed={2}
          />
          <TerminalLine
            text="+ @chukfi/cli@1.0.0"
            isOutput
            frame={frame}
            delay={40}
          />
          <TerminalLine
            text="added 1 package in 2s"
            isOutput
            frame={frame}
            delay={50}
          />
          <div style={{ height: 20 }} />
          <TerminalLine
            text="npx chukfi dev"
            frame={frame}
            delay={70}
            speed={2}
          />
          <TerminalLine
            text="✓ Docker detected (Docker Desktop)"
            isOutput
            frame={frame}
            delay={110}
          />
          <TerminalLine
            text="✓ PostgreSQL 17 started on port 5433"
            isOutput
            frame={frame}
            delay={120}
          />
          <TerminalLine
            text="✓ Migrations applied"
            isOutput
            frame={frame}
            delay={128}
          />
          <TerminalLine
            text="✓ Chukfi CMS running on http://localhost:8080"
            isOutput
            frame={frame}
            delay={136}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 3: Full-Screen Success ─────────────────────────── */
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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Checkmark — large */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: COLORS.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          opacity: p,
          transform: `scale(${p})`,
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.3)',
        }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.weight,
          fontSize: 72,
          color: COLORS.text,
          margin: 0,
          opacity: p,
          transform: `translateY(${(1 - p) * 25}px)`,
          letterSpacing: '-0.02em',
        }}
      >
        Your CMS is Live
      </h1>

      <p
        style={{
          fontFamily: FONT_MONO.family,
          fontWeight: 400,
          fontSize: 28,
          color: COLORS.brand,
          marginTop: 20,
          opacity: urlP,
          transform: `translateY(${(1 - urlP) * 20}px)`,
          backgroundColor: COLORS.surface,
          padding: '12px 32px',
          borderRadius: 8,
          border: `1px solid ${COLORS.surfaceLight}`,
        }}
      >
        http://localhost:8080
      </p>

      <p
        style={{
          fontFamily: FONT.family,
          fontWeight: 400,
          fontSize: 20,
          color: COLORS.textMuted,
          marginTop: 40,
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

      {/* Scene 2: Terminal — frames 40-135 */}
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
