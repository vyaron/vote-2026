import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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
    
    // Fetch party data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://knesset2026.co.il';
    const partyRes = await fetch(`${baseUrl}/data/parties/${id}.json`);
    
    if (!partyRes.ok) {
      return new Response('Party not found', { status: 404 });
    }
    
    const party = await partyRes.json();
    
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
            padding: '60px',
            gap: '40px',
          }}
        >
          {/* Party color bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12px',
              backgroundColor: party.color || '#3b82f6',
            }}
          />
          
          {/* Party logo placeholder */}
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '24px',
              backgroundColor: '#1f1f1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              border: `4px solid ${party.color || '#3b82f6'}`,
            }}
          >
            🏛️
          </div>
          
          {/* Party name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#ffffff',
              direction: 'rtl',
              textAlign: 'center',
            }}
          >
            {party.name}
          </div>
          
          {/* Member count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: '#1f1f1f',
              padding: '16px 32px',
              borderRadius: '100px',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: party.color || '#3b82f6',
              }}
            >
              {party.memberCount || '?'}
            </span>
            <span
              style={{
                fontSize: 28,
                color: '#a1a1aa',
                direction: 'rtl',
              }}
            >
              חברי כנסת
            </span>
          </div>
          
          {/* Site branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              כ
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              כנסת 2026
            </span>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
