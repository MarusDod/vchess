import { DndProvider } from 'react-dnd';
import Board from './components/Board';
import './styles/App.css';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useChessState } from './store';
import { PieceDragLayer } from './components/piece-drag-layer';
import { useShowModal } from './store/show-modal-store';
import PromotionPopover from './components/Board/promotion-dialog';

export default function App() {
    const { isPlaying, start, reset } = useChessState();
    const { showModal, resolve, reject } = useShowModal();

    return (
        <DndProvider backend={HTML5Backend}>
            <PieceDragLayer>
                <main>
                    <div>hello world</div>
                    {!isPlaying ? <button onClick={start}>start</button> : <button onClick={reset}>reset</button>}
                    <Board />
                    {showModal && <PromotionPopover onChoose={resolve} onClose={reject} />}
                </main>
            </PieceDragLayer>
        </DndProvider>
    );
}
