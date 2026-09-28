'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [shared, setShared] = useState(true)
  const router = useRouter()

  async function loadReminders() {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true })
    setReminders(data || [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      loadReminders()
    })
  }, [router])

  async function addReminder(e) {
    e.preventDefault()
    if (!title.trim() || !when) return
    await supabase.from('reminders').insert({
      title: title.trim(),
      remind_at: new Date(when).toISOString(),
      audience: shared ? 'both' : 'me',
      owner: user.email,
    })
    setTitle('')
    setWhen('')
    loadReminders()
  }

  async function toggle(r) {
    await supabase
      .from('reminders')
      .update({ is_done: !r.is_done })
      .eq('id', r.id)
    loadReminders()
  }

  async function remove(id) {
    await supabase.from('reminders').delete().eq('id', id)
    loadReminders()
  }

  const now = new Date()
  const overdue = reminders.filter((r) => !r.is_done && new Date(r.remind_at) < now)
  const upcoming = reminders.filter((r) => !r.is_done && new Date(r.remind_at) >= now)
  const done = reminders.filter((r) => r.is_done).reverse()

  function renderReminder(r, isOverdue) {
    const mine = user && r.owner === user.email
    const label = r.audience === 'me' ? 'Just me' : mine ? 'Both of us' : 'From them'
    return (
      <li
        key={r.id}
        className={
          isOverdue
            ? 'flex items-start gap-3 bg-white p-4 rounded-lg border border-rose'
            : 'flex items-start gap-3 bg-white p-4 rounded-lg'
        }
      >
        {mine && (
          <input
            type="checkbox"
            checked={r.is_done}
            onChange={() => toggle(r)}
            className="mt-1"
          />
        )}
        <div className="flex-1">
          <p className={r.is_done ? 'line-through opacity-50' : 'font-medium'}>
            {r.title}
          </p>
          <p className={isOverdue ? 'text-xs text-rose' : 'text-xs opacity-60'}>
            {new Date(r.remind_at).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            {' · '}
            {label}
          </p>
        </div>
        {mine && (
          <button onClick={() => remove(r.id)} className="text-sm opacity-60">
            ✕
          </button>
        )}
      </li>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-rose mb-6">Reminders</h1>
      <form onSubmit={addReminder} className="flex flex-col gap-3 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Remind us to..."
          className="p-3 rounded-lg border border-rose"
        />
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          required
          className="p-3 rounded-lg border border-rose bg-white"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
          />
          For both of us (untick to keep it just for you)
        </label>
        <button type="submit" className="bg-rose text-white p-3 rounded-lg">
          Add reminder ⏰
        </button>
      </form>
      {overdue.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-rose mb-3">Overdue</h2>
          <ul className="flex flex-col gap-3 mb-8">
            {overdue.map((r) => renderReminder(r, true))}
          </ul>
        </>
      )}
      <h2 className="text-xl font-semibold text-plum mb-3">Coming up</h2>
      <ul className="flex flex-col gap-3 mb-8">
        {upcoming.map((r) => renderReminder(r, false))}
      </ul>
      {upcoming.length === 0 && (
        <p className="text-sm opacity-60 mb-8">Nothing coming up.</p>
      )}
      {done.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-plum mb-3">Done</h2>
          <ul className="flex flex-col gap-3">
            {done.map((r) => renderReminder(r, false))}
          </ul>
        </>
      )}
    </main>
  )
}
