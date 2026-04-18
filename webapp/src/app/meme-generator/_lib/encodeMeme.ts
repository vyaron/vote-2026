export interface MemeLine {
  txt: string;
  size: number;
  color: string;
  fontFamily: string;
  align: 'left' | 'center' | 'right';
  x: number; // 0–1 fraction of canvas width
  y: number; // 0–1 fraction of canvas height
  rotation: number; // degrees
}

export interface MemeState {
  mkId: number;
  photoId: number;
  lines: MemeLine[];
  selectedLineIdx: number;
}

export function encodeMeme(state: MemeState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

export function decodeMeme(encoded: string): MemeState | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

export function defaultMeme(mkId: number, photoId: number): MemeState {
  return {
    mkId,
    photoId,
    selectedLineIdx: 0,
    lines: [
      {
        txt: '',
        size: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        align: 'center',
        x: 0.5,
        y: 0.85,
        rotation: 0,
      },
    ],
  };
}
