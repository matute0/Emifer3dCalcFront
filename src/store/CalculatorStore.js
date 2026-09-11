import {create} from 'zustand';

export const useCalculatorStore = create((set) => ({
    impType: 'simple',
    setImpType: (newType) => set({ impType: newType}),
}))