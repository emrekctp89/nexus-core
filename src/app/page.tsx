'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast';

// Tipleri tanımlayalım
type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  category_id: number | null; // YENİ
}
type Category = { // YENİ
  id: number;
  name: string;
}

export default function HomePage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([]) // YENİ
  const [newNote, setNewNote] = useState({ title: '', content: '', category_id: '' }) // YENİ
  const [loading, setLoading] = useState(true)
  // ... (düzenleme state'leri aynı kaldı)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Notları ve Kategorileri aynı anda çekelim (daha performanslı)
        const [notesResponse, categoriesResponse] = await Promise.all([
          supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('user_id', user.id).order('name', { ascending: true })
        ]);

        if (notesResponse.data) setNotes(notesResponse.data)
        if (categoriesResponse.data) setCategories(categoriesResponse.data)
      }
      setLoading(false)
    }
    getUserData()
  }, [supabase])

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newNote.title) return

    const noteToInsert = {
      title: newNote.title,
      content: newNote.content,
      user_id: user.id,
      category_id: newNote.category_id ? Number(newNote.category_id) : null,
    }

    const { data, error } = await supabase.from('notes').insert(noteToInsert).select().single()

    if (error) {
        toast.error('Not oluşturulurken hata oluştu.');
        console.error(error);
    } else {
        setNotes([data, ...notes]);
        setNewNote({ title: '', content: '', category_id: '' });
        toast.success('Not başarıyla oluşturuldu!');
    }
  }

  // Diğer handle fonksiyonları (delete, update vb.) aynı kaldı...
  const handleDeleteNote = async (noteId: number) => {
    if (!user) return
    if (confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      const { error } = await supabase.from('notes').delete().eq('id', noteId)
      if (error) { toast.error("Not silinirken bir hata oluştu."); } 
      else { setNotes(notes.filter(note => note.id !== noteId)); toast.success('Not başarıyla silindi!'); }
    }
  }
  const handleStartEdit = (note: Note) => { setEditingNoteId(note.id); setEditingTitle(note.title); setEditingContent(note.content); }
  const handleCancelEdit = () => { setEditingNoteId(null); setEditingTitle(''); setEditingContent(''); }
  const handleUpdateNote = async (noteId: number) => {
    if (!user) return;
    const { data, error } = await supabase.from('notes').update({ title: editingTitle, content: editingContent }).eq('id', noteId).select().single();
    if (error) { toast.error("Not güncellenirken bir hata oluştu."); } 
    else { setNotes(notes.map(note => note.id === noteId ? data : note)); handleCancelEdit(); toast.success('Not başarıyla güncellendi!'); }
  }

  if (loading) return <div className="p-8">Yükleniyor...</div>
  if (!user) return <div className="p-8 text-center">Lütfen notlarınızı görmek için <a href="/login" className="text-blue-500 underline">giriş yapın</a>.</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Not Defterim</h1>
      <form onSubmit={handleCreateNote} className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Yeni Not Ekle</h2>
        <input type="text" placeholder="Başlık" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} className="w-full p-2 mb-4 border rounded" required/>
        <textarea placeholder="İçerik..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="w-full p-2 mb-4 border rounded h-24"/>
        <select
          value={newNote.category_id}
          onChange={(e) => setNewNote({ ...newNote, category_id: e.target.value })}
          className="w-full p-2 mb-4 border rounded bg-white"
        >
          <option value="">Kategori Seç</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button type="submit" className="px-6 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600">Notu Kaydet</button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Notlarım</h2>
        <div className="space-y-4">
          {notes.map((note) => {
            const categoryName = categories.find(c => c.id === note.category_id)?.name;
            return (
              <div key={note.id} className="p-4 bg-white rounded-lg shadow">
                { editingNoteId === note.id ? ( 
                  /* Düzenleme Modu JSX */ 
                  <div>
                     <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="w-full p-2 mb-2 border rounded text-xl font-bold"/>
                     <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="w-full p-2 mb-4 border rounded h-24"/>
                     <div className="flex space-x-2">
                       <button onClick={() => handleUpdateNote(note.id)} className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded hover:bg-green-600">Kaydet</button>
                       <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-200 rounded hover:bg-gray-300">İptal</button>
                     </div>
                  </div>
                ) : ( 
                  /* DÜZELTİLMİŞ Normal Görünüm JSX */
                  <div>
                    {/* Üst kısım: Başlık, Kategori ve Butonlar için ana flex container */}
                    <div className="flex justify-between items-start mb-2">
                        {/* Sol taraf: Başlık ve Kategori */}
                        <div className="flex-grow mr-4">
                            <h3 className="text-xl font-bold">{note.title}</h3>
                            {categoryName && (
                                <span className="mt-1 inline-block text-xs font-semibold text-white bg-purple-500 px-2 py-1 rounded-full">
                                    {categoryName}
                                </span>
                            )}
                        </div>
                        {/* Sağ taraf: Butonlar */}
                        <div className="flex space-x-2 flex-shrink-0">
                            <button onClick={() => handleStartEdit(note)} className="px-3 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full hover:bg-yellow-600">Düzenle</button>
                            <button onClick={() => handleDeleteNote(note.id)} className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full hover:bg-red-700">Sil</button>
                        </div>
                    </div>

                    {/* Alt kısım: Not içeriği ve tarih */}
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-4">
                        Oluşturulma: {new Date(note.created_at).toLocaleString()}
                    </p>
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