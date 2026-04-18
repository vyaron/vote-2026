'use client';

import { useReducer } from 'react';
import type { MemeState, MemeLine } from './encodeMeme';

type MemeAction =
  | { type: 'SET_TEXT'; idx: number; txt: string }
  | { type: 'SET_COLOR'; idx: number; color: string }
  | { type: 'SET_SIZE'; idx: number; delta: number }
  | { type: 'SET_FONT'; idx: number; fontFamily: string }
  | { type: 'SET_ALIGN'; idx: number; align: MemeLine['align'] }
  | { type: 'SELECT_LINE'; idx: number }
  | { type: 'ADD_LINE' }
  | { type: 'DELETE_LINE'; idx: number }
  | { type: 'MOVE_LINE'; idx: number; x: number; y: number }
  | { type: 'SET_ROTATION'; idx: number; rotation: number }
  | { type: 'ADD_STICKER'; txt: string }
  | { type: 'LOAD'; state: MemeState };

const DEFAULT_LINE: MemeLine = {
  txt: '',
  size: 40,
  color: '#ffffff',
  fontFamily: 'Impact',
  align: 'center',
  x: 0.5,
  y: 0.5,
  rotation: 0,
};

function reducer(state: MemeState, action: MemeAction): MemeState {
  switch (action.type) {
    case 'SET_TEXT':
      return { ...state, lines: state.lines.map((l, i) => i === action.idx ? { ...l, txt: action.txt } : l) };
    case 'SET_COLOR':
      return { ...state, lines: state.lines.map((l, i) => i === action.idx ? { ...l, color: action.color } : l) };
    case 'SET_SIZE':
      return {
        ...state,
        lines: state.lines.map((l, i) =>
          i === action.idx ? { ...l, size: Math.max(10, Math.min(200, l.size + action.delta)) } : l
        ),
      };
    case 'SET_FONT':
      return { ...state, lines: state.lines.map((l, i) => i === action.idx ? { ...l, fontFamily: action.fontFamily } : l) };
    case 'SET_ALIGN':
      return { ...state, lines: state.lines.map((l, i) => i === action.idx ? { ...l, align: action.align } : l) };
    case 'SELECT_LINE':
      return { ...state, selectedLineIdx: action.idx };
    case 'ADD_LINE':
      return {
        ...state,
        lines: [...state.lines, { ...DEFAULT_LINE, y: 0.5 }],
        selectedLineIdx: state.lines.length,
      };
    case 'DELETE_LINE': {
      const newLines = state.lines.filter((_, i) => i !== action.idx);
      const safeLines = newLines.length === 0 ? [{ ...DEFAULT_LINE, y: 0.85 }] : newLines;
      return {
        ...state,
        lines: safeLines,
        selectedLineIdx: Math.min(state.selectedLineIdx, safeLines.length - 1),
      };
    }
    case 'SET_ROTATION':
      return { ...state, lines: state.lines.map((l, i) => i === action.idx ? { ...l, rotation: action.rotation } : l) };
    case 'ADD_STICKER':
      return {
        ...state,
        lines: [...state.lines, { ...DEFAULT_LINE, txt: action.txt, size: 72, fontFamily: 'Arial', x: 0.5, y: 0.5 }],
        selectedLineIdx: state.lines.length,
      };
    case 'MOVE_LINE':
      return {
        ...state,
        lines: state.lines.map((l, i) => i === action.idx ? { ...l, x: action.x, y: action.y } : l),
      };
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}

export function useMemeState(initial: MemeState) {
  return useReducer(reducer, initial);
}
