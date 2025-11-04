import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config'

const Ctx = createContext({ user: null })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div className="text-center py-20">جاري التحميل…</div>
  return <Ctx.Provider value={{ user }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
