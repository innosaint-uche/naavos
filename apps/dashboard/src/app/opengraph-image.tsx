import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NAAvOS - User-owned Avatar OS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '999px',
          border: '1px solid rgba(139,92,246,0.4)',
          background: 'rgba(139,92,246,0.1)',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#8b5cf6',
          }}
        />
        <span style={{ color: '#a78bfa', fontSize: '18px', fontWeight: 500 }}>
          Controlled development release — public gate in progress
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '28px',
        }}
      >
        <span
          style={{
            fontSize: '80px',
            fontWeight: 800,
            color: '#e4e4e7',
            letterSpacing: '-2px',
            lineHeight: 1.1,
          }}
        >
          Your context,
        </span>
        <span
          style={{
            fontSize: '80px',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a78bfa, #c084fc, #f472b6)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-2px',
            lineHeight: 1.1,
          }}
        >
          under your control.
        </span>
      </div>

      {/* Subtext */}
      <p
        style={{
          fontSize: '24px',
          color: '#71717a',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.5,
          margin: '0 0 48px',
        }}
      >
        Define an inspectable Avatar package and compile approved context for supported AI hosts —
        from a single avatar.json.
      </p>

      {/* Target pills */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {['Hermes', 'Codex', 'Antigravity', 'Claude Code', 'Gemini', 'ReMe'].map((name) => (
          <div
            key={name}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#a1a1aa',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Bottom brand */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span
          style={{
            fontSize: '22px',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #a78bfa, #c084fc)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          NAAvOS
        </span>
        <span style={{ color: '#3f3f46', fontSize: '18px' }}>·</span>
        <span style={{ color: '#52525b', fontSize: '18px' }}>naavos.radoss.agency</span>
      </div>
    </div>,
    { ...size }
  );
}
