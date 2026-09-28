'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  async function loadNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    setNotes(data || [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      loadNotes()
    })
  }, [router])

  async function addNote(e) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase
      .from('notes')
      .insert({ body: text.trim(), author: user.email })
    setText('')
    loadNotes()
  }

  async function remove(id) {
    await supabase.from('notes').delete().eq('id', id)
    loadNotes()
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-rose mb-6">Our Notes</h1>
      <form onSubmit={addNote} className="flex flex-col gap-3 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a little note..."
          rows={3}
          className="p-3 rounded-lg border border-rose"
        />
        <button type="submit" className="bg-rose text-white p-3 rounded-lg">
          Leave note 💌
        </button>
      </form>
      <ul className="flex flex-col gap-3">
        {notes.map((note) => {
          const mine = user && note.author === user.email
          return (
            <li
              key={note.id}
              className={
                mine
                  ? 'bg-blush border border-rose p-4 rounded-lg'
                  : 'bg-white p-4 rounded-lg'
              }
            >
              <p className="whitespace-pre-wrap">{note.body}</p>
              <div className="flex justify-between items-center mt-2 text-xs opacity-60">
                <span>
                  {mine ? 'You' : note.author} ·{' '}
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                {mine && (
                  <button onClick={() => remove(note.id)}>Delete</button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
