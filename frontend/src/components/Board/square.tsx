import styles from '../../styles/board.module.scss';
import { Piece, PiecePosition, piecesSvgDict } from '../../interfaces/chess';
import classNames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';
import { useEffect, useRef } from 'react';
import { getRow, useChessState } from '../../store';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useShowModal } from '../../store/show-modal-store';

const allPieceNames = Object.keys(piecesSvgDict);

type DropProps = {
    isBeingHovered: boolean;
};

export default function Square({ piece, index }: { piece?: PiecePosition; index: number }) {
    const play = useChessState((state) => state.play);
    const { openPromotionModal } = useShowModal();

    const squareRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, connectDrag, connectPreview] = useDrag(
        () => ({
            type: piece?.name.toString() || '',
            item: piece,
            canDrag() {
                return !!piece;
            },
            collect(monitor) {
                return {
                    isDragging: monitor.isDragging(),
                };
            },
        }),
        [piece]
    );

    const [{ isBeingHovered }, connectDrop] = useDrop<PiecePosition, any, DropProps>(
        () => ({
            accept: allPieceNames,
            collect(monitor) {
                return {
                    isBeingHovered: monitor.isOver(),
                };
            },
            canDrop(item) {
                return item.position != index;
            },
            async drop(item) {
                let pawnPromotion: Piece | undefined = undefined;

                if (item.name === Piece.Pawn && (item.team === 'black' ? getRow(index) === 7 : getRow(index) === 0)) {
                    try {
                        pawnPromotion = await openPromotionModal(squareRef);
                    } catch (err) {
                        return;
                    }
                }
                play(item.position, index, pawnPromotion);
            },
        }),
        [piece]
    );

    connectDrag(squareRef);
    connectDrop(squareRef);

    useEffect(() => {
        connectPreview(getEmptyImage(), { captureDraggingState: true });
    });

    return (
        <div
            className={classNames(styles.square, {
                [styles.stripe]: index % 2 === (Math.floor(index / 8) % 2 != 0 ? 0 : 1),
                [styles.hovered]: isBeingHovered && !isDragging,
            })}
            ref={squareRef}
            draggable={false}
        >
            {!!piece && (
                <img src={piecesSvgDict[piece.name][piece.team]} alt={piece.name.toString()} className={styles.piece} />
            )}
        </div>
    );
}
