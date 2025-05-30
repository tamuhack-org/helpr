import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = {
  name: string;
  isOpen: boolean;
};

type State = {
  categories: Category[]; // An array of projects
  setCategories: (categories: Category[]) => void; // Function to update projects
};

const useNavStore = create<State>(
  persist(
    (set, get) => ({
      categories: [],
      setCategories: (categories: Category[]) => set({ categories }),
    }),
    {
      name: 'nav-storage', // name of the item in the storage (must be unique)
    }
  ) as any
);

export default useNavStore;
