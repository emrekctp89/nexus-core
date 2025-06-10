'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setFullName(data.full_name || '')
          setUsername(data.username || '')
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username: username,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Profil başarıyla güncellendi!')
    }
  }

  if (loading) return <div className="p-8">Yükleniyor...</div>
  if (!user) return <div className="p-8 text-center">Lütfen profilinizi görmek için <a href="/login" className="text-blue-500 underline">giriş yapın</a>.</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profilim</h1>
      <form onSubmit={handleUpdateProfile} className="p-6 bg-white rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
          <input id="email" type="text" value={user.email} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Tam Ad</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <button type="submit" className="px-6 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
          Profili Güncelle
        </button>
      </form>
    </div>
  )
}