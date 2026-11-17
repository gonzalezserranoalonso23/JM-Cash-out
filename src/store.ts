import { create } from "zustand";
import { persist } from "zustand/middleware";

type CountStore = {
  quantities: Record<string, number>;
  setCount: (key: string, value: number) => void;
  reset: () => void;
};

export const useCountStore = create<CountStore>()(
  persist(
    (set) => ({
      quantities: {},
      setCount: (key, value) =>
        set((state) => ({
          quantities: {
            ...state.quantities,
            [key]: Math.max(0, value),
          },
        })),
      reset: () => set({ quantities: {} }),
    }),
    { name: "jm-cashout-quantities" },
  ),
);
