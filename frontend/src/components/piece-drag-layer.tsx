import { CSSProperties } from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { PiecePosition, piecesSvgDict } from '../interfaces/chess';
import styles from '../styles/board.module.scss';

const layerStyles: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }

    let { x, y } = currentOffset;

    x -= initialOffset.x;
    y -= initialOffset.y;
    x += initialOffset.x;
    y += initialOffset.y;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export function PieceDragLayer({ children }) {
    const { item, isDragging, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem() as PiecePosition,
        isDragging: monitor.isDragging(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    return (
        <>
            {children}
            {isDragging && (
                <div style={layerStyles}>
                    <img
                        style={getItemStyles(initialOffset, currentOffset)}
                        className={styles.preview}
                        src={piecesSvgDict[item.name][item.team]}
                    />
                </div>
            )}
        </>
    );
}
