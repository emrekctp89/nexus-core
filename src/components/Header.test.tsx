import { render, screen } from '@testing-library/react'
import Header from './Header'

// Supabase client'ını ve onAuthStateChange'i taklit ediyoruz (mocking)
// Testler veritabanına bağlanmamalı, sadece bileşenin kendisini test etmeli.
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: jest.fn(() => {
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        }
      }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}))

describe('Header Bileşeni', () => {
  it('Kullanıcı giriş yapmamışken "Giriş Yap" butonu görünmelidir', async () => {
    // 1. Adım: Bileşeni render et
    render(<Header />)

    // 2. Adım: Ekranda "Giriş Yap" metnine sahip bir element bulmayı bekle
    const loginButton = await screen.findByRole('link', { name: /giriş yap/i })

    // 3. Adım: Elementin belgede olduğunu doğrula
    expect(loginButton).toBeInTheDocument()
  })
})