import { create } from 'zustand';
import { Piece } from '../interfaces/chess';
import { identity } from 'lodash';
import { RefObject, createRef } from 'react';

interface ShowModalState {
    showModal: boolean;
    resolve: (piece: Piece) => any;
    reject: () => any;
    openPromotionModal: (anchor: RefObject<HTMLDivElement>) => Promise<Piece>;
}

export const useShowModal = create<ShowModalState>((set) => ({
    showModal: false,
    resolve: identity,
    reject: identity,
    openPromotionModal() {
        return new Promise((resolve, reject) =>
            set({
                showModal: true,
                resolve: (piece) => {
                    set({
                        showModal: false,
                    });

                    resolve(piece);
                },
                reject: () => {
                    set({
                        showModal: false,
                    });

                    reject();
                },
            })
        );
    },
}));
