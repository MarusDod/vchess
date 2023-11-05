import { createPortal } from 'react-dom';
import styles from '../../styles/board.module.scss';
import { Piece, piecesSvgDict } from '../../interfaces/chess';
import { useChessState } from '../../store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useRef } from 'react';

interface PromotionDialogProps {
    onChoose: (piece: Piece) => Promise<any>;
    onClose: () => any;
}

const dialogRoot = document.createElement('div');
dialogRoot.id = 'promotion-dialog-root';
document.body.appendChild(dialogRoot);

const validPieces = [Piece.Bishop, Piece.Queen, Piece.Knight, Piece.Rook];

const PromotionDialog: React.FC<PromotionDialogProps> = (props) => {
    const team = useChessState(useShallow((state) => state.turn));
    const dialogRef = useRef<HTMLDialogElement>(null);
    const el = document.createElement('div');

    useEffect(() => {
        dialogRoot.appendChild(el);

        if (!dialogRef.current) return;

        const callback = () => props.onClose();

        dialogRef.current.showModal();

        dialogRoot.addEventListener('click', callback);
        dialogRoot.addEventListener('touchstart', callback);

        return () => {
            dialogRef.current?.close();
            dialogRoot.removeChild(el);
            dialogRoot.removeEventListener('click', callback);
            dialogRoot.removeEventListener('touchstart', callback);
        };
    }, []);

    return createPortal(
        <dialog ref={dialogRef} className={styles.promotionDialog}>
            {validPieces.map((piece) => (
                <img
                    key={piece}
                    src={piecesSvgDict[piece][team]}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        props.onChoose(piece);
                    }}
                    alt={piece.toString()}
                    className={styles.piece}
                />
            ))}
        </dialog>,
        el
    );
};

export default PromotionDialog;
