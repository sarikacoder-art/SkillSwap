import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = useCallback((email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signup = useCallback(async ({ email, password, displayName, neighbourhood }) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    const { createUserProfile } = await import('../services/userService')

    await createUserProfile({
      uid: result.user.uid,
      email,
      displayName,
      neighbourhood,
    })

    return result
  }, [])

  const logout = useCallback(() => {
    return signOut(auth)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Unblock the UI immediately after auth succeeds.
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        displayName:
          authUser.displayName ||
          (authUser.email ? authUser.email.split('@')[0] : ''),
      })
      setLoading(false)
    })

    return unsub
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
