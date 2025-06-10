'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Kayıt başarılı! Lütfen e-postanızı kontrol edin.')
    }
  }

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Giriş başarılı!')
      window.location.href = '/' // Ana sayfaya yönlendir
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-xs p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Giriş Yap</h1>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-4">
          <button
            onClick={handleSignIn}
            className="w-full py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Giriş Yap
          </button>
          <button
            onClick={handleSignUp}
            className="w-full py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  )
}