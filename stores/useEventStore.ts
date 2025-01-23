import { create } from 'zustand';
import { Event } from '@prisma/client';
import { persist } from 'zustand/middleware';

type State = {
  events: Event[]; // An array of projects
  activeEvent: Event | null; // The currently active project or null
  setEvents: (events: Event[]) => void; // Function to update projects
  setActiveEvent: (event: Event) => void; // Function to set the active project
};

const useEventStore = create<State>(
  persist(
    (set) => ({
      events: [],
      activeEvents: null,
      setEvents: (events: Event[]) => set({ events }),
      setActiveEvent: (event: Event) => set({ activeEvent: event }),
    }),
    {
      name: 'event-storage', // name of the item in the storage (must be unique)
    }
  ) as any
);

export default useEventStore;
