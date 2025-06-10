import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Tiplerimizi tanımlayalım
type Note = { id: number; title: string; content: string; created_at: string; category_id: number | null; }
type Category = { id: number; name: string; }

// Store'umuzun içinde nelerin olacağını tanımlayan arayüz (interface)
interface NotesState {
  notes: Note[];
  categories: Category[];
  loading: boolean;
  fetchNotesAndCategories: (user: User) => Promise<void>;
  createNote: (noteData: { title: string; content: string; category_id: string; user_id: string; }) => Promise<void>;
  deleteNote: (noteId: number) => Promise<void>;
  updateNote: (noteId: number, updateData: { title: string; content: string; }) => Promise<void>;
}

const supabase = createClient()

export const useNotesStore = create<NotesState>((set, get) => ({
  // Başlangıç değerleri
  notes: [],
  categories: [],
  loading: true,

  // Verileri çeken fonksiyon
  fetchNotesAndCategories: async (user) => {
    set({ loading: true });
    const [notesResponse, categoriesResponse] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id).order('name', { ascending: true })
    ]);
    set({
      notes: notesResponse.data || [],
      categories: categoriesResponse.data || [],
      loading: false,
    });
  },

  // Yeni not oluşturan fonksiyon
  createNote: async (noteData) => {
    const noteToInsert = {
      ...noteData,
      category_id: noteData.category_id ? Number(noteData.category_id) : null,
    }
    const { data, error } = await supabase.from('notes').insert(noteToInsert).select().single()
    if (data) {
      set(state => ({ notes: [data, ...state.notes] }));
    } else {
      throw new Error(error?.message || "Not oluşturulamadı");
    }
  },

  // Not silen fonksiyon
  deleteNote: async (noteId) => {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) {
      throw new Error(error.message);
    } else {
      set(state => ({ notes: state.notes.filter(note => note.id !== noteId) }));
    }
  },

  // Not güncelleyen fonksiyon
  updateNote: async (noteId, updateData) => {
    const { data, error } = await supabase.from('notes').update(updateData).eq('id', noteId).select().single();
    if (error) {
      throw new Error(error.message);
    } else {
      set(state => ({
        notes: state.notes.map(note => (note.id === noteId ? data : note)),
      }));
    }
  }
}));