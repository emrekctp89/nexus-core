import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Bu fonksiyonun adı aynı kalıyor, bu yüzden başka bir dosyayı değiştirmemize gerek yok.
export const createClient = () =>
  // Sadece içindeki Supabase fonksiyonunu doğru olanla değiştiriyoruz.
  createClientComponentClient(
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    }
  )