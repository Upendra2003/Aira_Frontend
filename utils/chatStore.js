import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useChatStore = create(
  persist(
    (set) => ({
      messages: [],

      addMessage: (message) =>
        set((state) => {
          const updatedMessages = [...state.messages, message];
          // Keep only the last 4 messages
          const lastFourMessages = updatedMessages.slice(-4);
          return { messages: lastFourMessages };
        }),

      setMessages: (newMessages) =>
        set(() => ({
          messages: newMessages.slice(-4), // Always store only last 4 messages
        })),

      clearChat: () => set({ messages: [] }),

      removeMessageByTypingId: (typingId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.typingId !== typingId),
        })),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
