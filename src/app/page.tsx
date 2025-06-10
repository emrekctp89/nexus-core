'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useNotesStore } from '@/store/notesStore' // YENİ: Store'umuzu import ediyoruz

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)

  // Zustand store'undan verileri ve fonksiyonları çekiyoruz
  const { notes, categories, loading, fetchNotesAndCategories, createNote, deleteNote, updateNote } = useNotesStore();

  // Düzenleme modu için state'ler burada kalabilir, çünkü bu sadece bu sayfanın anlık bir durumu
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [newNote, setNewNote] = useState({ title: '', content: '', category_id: '' })

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Sadece verileri çekme fonksiyonunu çağırıyoruz
        fetchNotesAndCategories(user)
      }
    }
    getUser()
  }, [fetchNotesAndCategories])

  // Form gönderme işlemleri artık store'daki fonksiyonları çağırıyor
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    try {
      await createNote({ ...newNote, user_id: user.id });
      toast.success('Not başarıyla oluşturuldu!');
      setNewNote({ title: '', content: '', category_id: '' });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (confirm("Bu notu silmek istediğinizden emin misiniz?")) {
        try {
            await deleteNote(noteId);
            toast.success('Not başarıyla silindi!');
        } catch (error) {
            toast.error((error as Error).message);
        }
    }
  }

  const handleUpdateNote = async (noteId: number) => {
    try {
        await updateNote(noteId, { title: editingTitle, content: editingContent });
        toast.success('Not başarıyla güncellendi!');
        setEditingNoteId(null);
    } catch (error) {
        toast.error((error as Error).message);
    }
  }

  // Düzenleme modunu başlatan ve bitiren basit fonksiyonlar
  const handleStartEdit = (note: typeof notes[0]) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content || '');
  }
  const handleCancelEdit = () => setEditingNoteId(null);

  // --- JSX KISMI NEREDEYSE HİÇ DEĞİŞMEDİ ---
  if (loading && !notes.length) return <div className="p-8">Yükleniyor...</div>
  if (!user) return <div className="p-8 text-center">Lütfen notlarınızı görmek için <a href="/login" className="text-blue-500 underline">giriş yapın</a>.</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ... Form ve Not listesi JSX'i aynı, sadece fonksiyon adları güncellendi ... */}
      <h1 className="text-3xl font-bold mb-6">Not Defterim</h1>
      <form onSubmit={handleCreateNote} className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Yeni Not Ekle</h2>
        <input type="text" placeholder="Başlık" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} className="w-full p-2 mb-4 border rounded" required/>
        <textarea placeholder="İçerik..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="w-full p-2 mb-4 border rounded h-24"/>
        <select value={newNote.category_id} onChange={(e) => setNewNote({ ...newNote, category_id: e.target.value })} className="w-full p-2 mb-4 border rounded bg-white">
          <option value="">Kategori Seç</option>
          {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
        </select>
        <button type="submit" className="px-6 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600">Notu Kaydet</button>
      </form>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Notlarım</h2>
        <div className="space-y-4">
          {notes.map((note) => {
            const categoryName = categories.find(c => c.id === note.category_id)?.name;
            return (
              <div key={note.id} className="p-4 bg-white rounded-lg shadow relative">
                { editingNoteId === note.id ? ( 
                  <div>
                     <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="w-full p-2 mb-2 border rounded text-xl font-bold"/>
                     <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="w-full p-2 mb-4 border rounded h-24"/>
                     <div className="flex space-x-2">
                       <button onClick={() => handleUpdateNote(note.id)} className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded hover:bg-green-600">Kaydet</button>
                       <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-200 rounded hover:bg-gray-300">İptal</button>
                     </div>
                  </div>
                ) : ( 
                  <div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-grow mr-4">
                            <h3 className="text-xl font-bold">{note.title}</h3>
                            {categoryName && (<span className="mt-1 inline-block text-xs font-semibold text-white bg-purple-500 px-2 py-1 rounded-full">{categoryName}</span>)}
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            <button onClick={() => handleStartEdit(note)} className="px-3 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full hover:bg-yellow-600">Düzenle</button>
                            <button onClick={() => handleDeleteNote(note.id)} className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full hover:bg-red-700">Sil</button>
                        </div>
                    </div>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-4">Oluşturulma: {new Date(note.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}