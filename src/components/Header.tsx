'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // İlk yüklemede kullanıcıyı kontrol et
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    checkUser()

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload() // Sayfayı yenileyerek durumu güncelleyelim
  }

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        NexusCore
      </Link>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="hover:underline">
                <span>{user.email}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
            Giriş Yap
          </Link>
        )}
      </nav>
    </header>
  )
}