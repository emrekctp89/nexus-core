'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast';

// Avatar bileşenini ve yükleme mantığını buraya ekliyoruz
function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
  const [uploading, setUploading] = useState(false)

  // Veritabanındaki avatar_url (dosya yolu) değiştiğinde resmi indirip göstermek için
  const downloadImage = useCallback(async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }, [supabase.storage])

  useEffect(() => {
    if (url) {
      downloadImage(url)
    } else {
        setAvatarUrl(null); // URL yoksa, avatarı temizle
    }
  }, [url, downloadImage])

  // Resim yükleme fonksiyonu
  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      if (!uid) {
        throw new Error('Kullanıcı bulunamadı, yükleme yapılamaz.')
      }
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Yüklemek için bir resim seçmelisiniz.')
      }
      
      setUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) {
        throw uploadError
      }
      
      // Yükleme başarılı, ana bileşene yeni dosya yolunu (path) gönder
      onUpload(filePath)
    } catch (error) {
      alert('Resim yüklenirken hata oluştu!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="bg-gray-200 rounded-full"
          style={{ height: size, width: size }}
        />
      )}
      <div style={{ width: size }} className="mt-4">
        <label className="button primary block text-center cursor-pointer bg-gray-200 p-2 rounded-md hover:bg-gray-300" htmlFor="single">
          {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
        </label>
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}


export default function ProfilePage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async (user: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) throw error
      if (data) {
        setFullName(data.full_name || '')
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || null)
      }
    } catch (error) {
      alert('Profil bilgileri alınırken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if(user) {
            setUser(user)
            getProfile(user)
        } else {
            setLoading(false)
        }
    }
    getUser()
  }, [supabase, getProfile])
  
  const handleUpdateProfile = async (e: React.FormEvent, filePath?: string) => {
    e.preventDefault();
    if (!user) return

    const updates = {
      id: user.id,
      full_name: fullName,
      username: username,
      avatar_url: filePath !== undefined ? filePath : avatar_url,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) {
        toast.error(error.message)
    } else {
      if (filePath) {
        setAvatarUrl(filePath)
      }
      toast.success('Profil başarıyla güncellendi!')
    }
  }

  if (loading) return <div className="p-8">Yükleniyor...</div>
  if (!user) return <div className="p-8 text-center">Lütfen profilinizi görmek için <a href="/login" className="text-blue-500 underline">giriş yapın</a>.</div>

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
      <Avatar
        uid={user.id}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          // Bu fonksiyon artık doğrudan handleUpdateProfile'i çağırmıyor, sadece state'i güncelliyor.
          // Kaydetme işlemi formdaki buton ile yapılacak.
          setAvatarUrl(url); 
          // Anında veritabanına kaydetmek istersek:
          handleUpdateProfile({ preventDefault: () => {} } as React.FormEvent, url);
        }}
      />

      <form onSubmit={(e) => handleUpdateProfile(e)} className="w-full p-6 bg-white rounded-lg shadow">
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
          Değişiklikleri Kaydet
        </button>
      </form>
    </div>
  )
}