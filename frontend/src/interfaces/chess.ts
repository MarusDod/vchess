import BlackKing from '../assets/king-black.svg';
import WhiteKing from '../assets/king-white.svg';
import BlackKnight from '../assets/knight-black.svg';
import WhiteKnight from '../assets/knight-white.svg';
import BlackBishop from '../assets/bishop-black.svg';
import WhiteBishop from '../assets/bishop-white.svg';
import BlackRook from '../assets/rook-black.svg';
import WhiteRook from '../assets/rook-white.svg';
import BlackPawn from '../assets/pawn-black.svg';
import WhitePawn from '../assets/pawn-white.svg';
import BlackQueen from '../assets/queen-black.svg';
import WhiteQueen from '../assets/queen-white.svg';

export enum Piece {
    King = 'King',
    Queen = 'Queen',
    Bishop = 'Bishop',
    Pawn = 'Pawn',
    Knight = 'Knight',
    Rook = 'Rook',
}

export type PositionLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type PositionNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Position = `${PositionLetter}${PositionNumber}`;

export type Team = 'black' | 'white';

export interface PiecePosition {
    name: Piece;
    position: number;
    team: Team;
}

export interface ChessLog {
    team: Team;
    name: Piece;
    from: number;
    to: number;
    kill?: Piece;
}

export const piecesSvgDict: Record<Piece, Record<Team, string>> = {
    [Piece.Bishop]: {
        black: BlackBishop,
        white: WhiteBishop,
    },
    [Piece.Knight]: {
        black: BlackKnight,
        white: WhiteKnight,
    },
    [Piece.Rook]: {
        black: BlackRook,
        white: WhiteRook,
    },
    [Piece.Pawn]: {
        black: BlackPawn,
        white: WhitePawn,
    },
    [Piece.Queen]: {
        black: BlackQueen,
        white: WhiteQueen,
    },
    [Piece.King]: {
        black: BlackKing,
        white: WhiteKing,
    },
};
