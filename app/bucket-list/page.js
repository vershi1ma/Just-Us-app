'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { displayName } from '../lib/names'

export default function BucketList() {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const router = useRouter()

  async function loadItems() {
    const { data } = await supabase
      .from('bucket_list')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      loadItems()
    })
  }, [router])

  async function addItem(e) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase
      .from('bucket_list')
      .insert({ item: text.trim(), added_by: user.email })
    setText('')
    loadItems()
  }

  async function toggle(item) {
    await supabase
      .from('bucket_list')
      .update({ is_done: !item.is_done })
      .eq('id', item.id)
    loadItems()
  }

  async function remove(id) {
    await supabase.from('bucket_list').delete().eq('id', id)
    loadItems()
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditText(item.item)
  }

  async function saveEdit(id) {
    if (!editText.trim()) return
    await supabase.from('bucket_list').update({ item: editText.trim() }).eq('id', id)
    setEditingId(null)
    loadItems()
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-rose mb-6">Our Bucket List</h1>
      <form onSubmit={addItem} className="flex gap-2 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something we want to do together..."
          className="flex-1 p-3 rounded-lg border border-rose"
        />
        <button type="submit" className="bg-rose text-white px-4 rounded-lg">
          Add
        </button>
      </form>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
            <input
              type="checkbox"
              checked={item.is_done}
              onChange={() => toggle(item)}
            />
            {editingId === item.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-rose text-sm"
                  autoFocus
                />
                <button onClick={() => saveEdit(item.id)} className="text-sm text-rose font-bold">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-sm opacity-60">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-1" onClick={() => startEdit(item)}>
                <p className={item.is_done ? 'line-through opacity-50' : ''}>{item.item}</p>
                <p className="text-xs opacity-60">added by {displayName(item.added_by)}</p>
              </div>
            )}
            <button onClick={() => remove(item.id)} className="text-sm opacity-60">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
