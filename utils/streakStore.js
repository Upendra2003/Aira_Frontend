import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

export const useStreakStore = create(
  persist(
    (set, get) => ({
      streakData: [
        { day: 'Mon', active: false },
        { day: 'Tue', active: false },
        { day: 'Wed', active: false },
        { day: 'Thu', active: false },
        { day: 'Fri', active: false },
        { day: 'Sat', active: false },
        { day: 'Sun', active: false },
      ],
      lastOpenedDate: null,

      updateStreak: () => {
        const today = new Date();
        const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Sunday, map to index 6

        const streakData = [...get().streakData];
        streakData[todayIndex].active = true;

        set({ streakData, lastOpenedDate: today.toDateString() });
      },
    }),
    {
      name: 'streak-storage', // storage key
      getStorage: () => AsyncStorage,
    }
  )
);
