import styles from '../../styles/board.module.scss';
import { useMemo } from 'react';
import Square from './square';
import { useChessState } from '../../store';
import { useShallow } from 'zustand/react/shallow';

export default function Board() {
    const pieces = useChessState(useShallow((state) => state.pieces));

    const squares = useMemo(
        () =>
            Array(64)
                .fill(null)
                .map((_, index) => pieces.find((p) => p.position === index)),
        [pieces]
    );

    return (
        <div className={styles.board}>
            {squares.map((piece, index) => (
                <Square key={index} piece={piece} index={index} />
            ))}
        </div>
    );
}
