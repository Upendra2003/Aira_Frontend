import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getItem, setItem, deleteItemAsync } from 'expo-secure-store'

type UserState = {
  isLoggedin: boolean
  shouldCreateAccount: boolean
  isAssessed: boolean
  token: string | null
  refreshToken: string | null
  userId: string | null
  username: string | null
  email: string | null
  assessmentFlag: number | null

  Login: (payload: {
    token: string,
    refreshToken: string,
    userId: string,
    username: string,
    email: string,
    assessmentFlag: number
  }) => void

  LogOut: () => void
  Assessed: () => void
  Reset: () => void // for testing assessment
}

export const useAuthStore = create(
  persist<UserState>(
    set => ({
      isLoggedin: false,
      shouldCreateAccount: false,
      isAssessed: false,
      token: null,
      refreshToken: null,
      userId: null,
      username: null,
      email: null,
      assessmentFlag: null,

      Login: ({ token, refreshToken, userId, username, email, assessmentFlag }) => {
        set(state => ({
          ...state,
          isLoggedin: true,
          token,
          refreshToken,
          userId,
          username,
          email,
          assessmentFlag
        }))
      },

      LogOut: () => {
        set(() => ({
          isLoggedin: false,
          token: null,
          refreshToken: null,
          userId: null,
          username: null,
          email: null,
          assessmentFlag: null
        }))
      },

      Assessed: () => {
        set(state => ({
          ...state,
          isAssessed: true
        }))
      },

      Reset: () => {
        set(state => ({
          ...state,
          isAssessed: false
        }))
      }
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        setItem,
        getItem,
        removeItem: deleteItemAsync
      }))
    }
  )
)
