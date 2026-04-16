import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Size for OG images
const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch MK data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://knesset2026.co.il';
    const mkRes = await fetch(`${baseUrl}/data/mks/${id}.json`);
    
    if (!mkRes.ok) {
      return new Response('MK not found', { status: 404 });
    }
    
    const mk = await mkRes.json();
    
    // Load font
    const heeboFont = await fetch(
      new URL('https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EJSfa0xRa.woff2', import.meta.url)
    ).then((res) => res.arrayBuffer()).catch(() => null);
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: '#0a0a0a',
            padding: '60px',
            gap: '60px',
          }}
        >
          {/* Photo */}
          <div
            style={{
              display: 'flex',
              width: '300px',
              height: '400px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '4px solid #3b82f6',
              flexShrink: 0,
            }}
          >
            <img
              src={`${baseUrl}/data/photos/${id}/profile.jpg`}
              alt={mk.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          
          {/* Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flex: 1,
              gap: '16px',
            }}
          >
            {/* Name */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: '#ffffff',
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              {mk.name}
            </div>
            
            {/* Party badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#3b82f6',
                padding: '12px 24px',
                borderRadius: '100px',
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#ffffff',
                  direction: 'rtl',
                }}
              >
                {mk.faction}
              </span>
            </div>
            
            {/* Position */}
            {mk.position && (
              <div
                style={{
                  fontSize: 28,
                  color: '#a1a1aa',
                  direction: 'rtl',
                }}
              >
                {mk.position}
              </div>
            )}
            
            {/* Site branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                כ
              </div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                כנסת 2026
              </span>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: heeboFont ? [
          {
            name: 'Heebo',
            data: heeboFont,
            style: 'normal',
            weight: 700,
          },
        ] : [],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
