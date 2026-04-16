import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

const size = {
  width: 1200,
  height: 630,
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '40px',
          }}
        >
          כ
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '20px',
          }}
        >
          כנסת 2026
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: '#a1a1aa',
            direction: 'rtl',
            textAlign: 'center',
          }}
        >
          מידע מקיף על חברי הכנסת ה-25 של ישראל
        </div>
        
        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '48px',
            marginTop: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: '#3b82f6',
              }}
            >
              120
            </span>
            <span
              style={{
                fontSize: 24,
                color: '#71717a',
              }}
            >
              חברי כנסת
            </span>
          </div>
          
          <div
            style={{
              width: '2px',
              height: '80px',
              backgroundColor: '#27272a',
            }}
          />
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: '#3b82f6',
              }}
            >
              14
            </span>
            <span
              style={{
                fontSize: 24,
                color: '#71717a',
              }}
            >
              סיעות
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
