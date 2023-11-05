import { create } from 'zustand';
import { ChessLog, Piece, PiecePosition, Team } from '../interfaces/chess';
import { devtools } from 'zustand/middleware';
import { once, range, slice, zip } from 'lodash';

const backRow: Piece[] = [
    Piece.Rook,
    Piece.Knight,
    Piece.Bishop,
    Piece.Queen,
    Piece.King,
    Piece.Bishop,
    Piece.Knight,
    Piece.Rook,
];

const initialPiecesWhite: PiecePosition[] = [...backRow, ...Array(8).fill(Piece.Pawn)].map((name, position) => ({
    name,
    position,
    team: 'black',
}));

const initialPiecesBlack: PiecePosition[] = [...backRow.reverse(), ...Array(8).fill(Piece.Pawn)].map(
    (name, position) => ({
        name,
        team: 'white',
        position: 63 - position,
    })
);

const initialPieces = [...initialPiecesWhite, ...initialPiecesBlack];

const initialState = {
    isPlaying: false,
    pieces: [...initialPieces],
    turn: 'white' as Team,
    logs: [] as ChessLog[],
};

export function getRow(position: number): number {
    return Math.floor(position / 8);
}
export function getColumn(position: number): number {
    return position % 8;
}

function getIndex(row: number, column: number): number {
    return row * 8 + column;
}

export type ChessState = typeof initialState;

interface IChessReducer extends ChessState {
    reset: () => void;
    start: () => void;
    move: (from: number, to: number, promotion?: Piece) => PiecePosition[];
    play: (from: number, to: number, promotion?: Piece) => void;
    canCastle: (team: Team, rook: number) => boolean;
    isValidMove: (from: number, to: number, pieces?: PiecePosition[]) => boolean;
    isInCheck: (futurePieces?: PiecePosition[], turn?: Team) => boolean;
}

export const useChessState = create<IChessReducer>()(
    devtools((set, get) => ({
        ...initialState,
        reset: () => set(initialState),
        start: () => set({ isPlaying: true }),
        move(from, to, promotion) {
            const fromPiece = get().pieces.find((p) => p.position === from)!!;

            const toPiece = get().pieces.find((p) => p.position === to);

            let finalPosition = to;
            let rookPosition = to;

            //is castling?
            if (toPiece && toPiece.team === fromPiece.team) {
                if (getColumn(to) === 0) {
                    rookPosition = getIndex(getRow(to), 2);
                    finalPosition = getIndex(getRow(to), 1);
                } else if (getColumn(to) === 7) {
                    rookPosition = getIndex(getRow(to), 5);
                    finalPosition = getIndex(getRow(to), 6);
                }
            }

            return get().pieces.flatMap((p) =>
                p.position === from
                    ? {
                          ...p,
                          position: finalPosition,
                          name:
                              fromPiece.name === Piece.Pawn &&
                              getRow(finalPosition) == (fromPiece.team === 'white' ? 0 : 7)
                                  ? promotion!!
                                  : p.name,
                      }
                    : p.position === to
                    ? p.team !== fromPiece.team
                        ? []
                        : { ...p, position: rookPosition }
                    : p
            );
        },
        canCastle(team: Team, rook) {
            return (
                !get().logs.some(
                    (l) =>
                        l.team === team &&
                        (l.name === Piece.King || (l.name === Piece.Rook && getColumn(l.from) === rook))
                ) && !get().isInCheck(get().pieces, team)
            );
        },
        isInCheck(futurePieces = get().pieces, turn = get().turn) {
            const king = futurePieces.find((p) => p.name === Piece.King && p.team === turn)!!;

            return futurePieces
                .filter((p) => p.team != turn)
                .some((p) => get().isValidMove(p.position, king.position, futurePieces));
        },
        isValidMove(from, to, pieces = get().pieces) {
            const fromPiece = pieces.find((p) => p.position === from);
            const toPiece = pieces.find((p) => p.position === to);

            if (!fromPiece) {
                return false;
            }

            if (to < 0 || to > 63 || from === to) {
                return false;
            }

            const isDiagonal = Math.abs(getRow(from) - getRow(to)) === Math.abs(getColumn(from) - getColumn(to));

            const isHorizontal = getRow(from) === getRow(to) || getColumn(from) === getColumn(to);

            const hasDiagonalObstacle = () => {
                return (
                    isDiagonal &&
                    slice(zip(range(getRow(from), getRow(to)), range(getColumn(from), getColumn(to))), 1).some(
                        ([row, column]) => pieces.some((p) => p.position === getIndex(row!!, column!!))
                    )
                );
            };

            const hasHorizontalObstacle = () => {
                return isHorizontal && getRow(from) === getRow(to)
                    ? slice(range(getColumn(from), getColumn(to)), 1).some((column) =>
                          pieces.some((p) => p.position === getIndex(getRow(from), column))
                      )
                    : slice(range(getRow(from), getRow(to)), 1).some((row) =>
                          pieces.some((p) => p.position === getIndex(row, getColumn(from)))
                      );
            };

            const castle = once(
                () =>
                    fromPiece.name === Piece.King &&
                    toPiece?.name === Piece.Rook &&
                    fromPiece.team === toPiece.team &&
                    getColumn(from) === 4 &&
                    [0, 7].includes(getColumn(to)) &&
                    this.canCastle(fromPiece.team, getColumn(to))
            );

            if (pieces.some((p) => p.position === to && p.team === fromPiece.team && !castle())) {
                return false;
            }

            switch (fromPiece.name) {
                case Piece.Bishop:
                    return isDiagonal && !hasDiagonalObstacle();
                case Piece.Rook:
                    return isHorizontal && !hasHorizontalObstacle();
                case Piece.Queen:
                    return (isHorizontal && !hasHorizontalObstacle()) || (isDiagonal && !hasDiagonalObstacle());
                case Piece.Knight:
                    return (
                        (Math.abs(getRow(from) - getRow(to)) === 2 &&
                            Math.abs(getColumn(from) - getColumn(to)) === 1) ||
                        (Math.abs(getRow(from) - getRow(to)) === 1 && Math.abs(getColumn(from) - getColumn(to)) === 2)
                    );
                case Piece.Pawn: {
                    const isWhite = fromPiece.team === 'white';

                    const validMoveCount =
                        (getRow(from) === 1 && !isWhite) || (getRow(from) === 6 && isWhite)
                            ? (x) => x == 2 || x == 1
                            : (x) => x == 1;

                    const rowDiff = getRow(to) - getRow(from);

                    return (
                        getColumn(from) === getColumn(to) &&
                        (isWhite ? rowDiff < 0 : rowDiff > 0) &&
                        validMoveCount(Math.abs(rowDiff)) &&
                        !hasHorizontalObstacle()
                    );
                }
                case Piece.King: {
                    const rowDiff = Math.abs(getRow(from) - getRow(to));
                    const colDiff = Math.abs(getColumn(from) - getColumn(to));
                    return (rowDiff < 2 && colDiff < 2) || castle();
                }
                default:
                    return false;
            }
        },
        play(from, to, promotion) {
            if (!get().isPlaying) {
                return;
            }

            const turn = get().turn;
            const fromPiece = get().pieces.find((p) => p.team === turn && p.position === from);

            if (!fromPiece || fromPiece.team != turn) {
                return;
            }

            const toPiece = get().pieces.find((p) => p.position === to);

            if (!get().isValidMove(from, to) || get().isInCheck(get().move(from, to))) {
                return;
            }

            set({
                pieces: get().move(from, to, promotion),
                logs: [
                    ...get().logs,
                    {
                        team: turn,
                        from,
                        to,
                        name: fromPiece.name,
                        kill: toPiece?.name,
                    },
                ],
                turn: turn === 'white' ? 'black' : 'white',
            });
        },
    }))
);
