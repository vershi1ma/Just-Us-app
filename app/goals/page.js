'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const categories = ['Savings', 'Study', 'Work', 'Other']

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Savings')
  const [target, setTarget] = useState('')
  const [amounts, setAmounts] = useState({})
  const router = useRouter()

  async function loadGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    setGoals(data || [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      loadGoals()
    })
  }, [router])

  async function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('goals').insert({
      title: title.trim(),
      category,
      owner: user.email,
      target_amount: target ? Number(target) : null,
    })
    setTitle('')
    setTarget('')
    loadGoals()
  }

  async function addSavings(goal) {
    const value = Number(amounts[goal.id])
    if (!value) return
    await supabase
      .from('goals')
      .update({ saved_amount: Number(goal.saved_amount) + value })
      .eq('id', goal.id)
    setAmounts({ ...amounts, [goal.id]: '' })
    loadGoals()
  }

  async function toggle(goal) {
    await supabase
      .from('goals')
      .update({ is_done: !goal.is_done })
      .eq('id', goal.id)
    loadGoals()
  }

  async function remove(id) {
    await supabase.from('goals').delete().eq('id', id)
    loadGoals()
  }

  const mine = goals.filter((g) => user && g.owner === user.email)
  const theirs = goals.filter((g) => user && g.owner !== user.email)

  function renderGoal(goal, editable) {
    const hasTarget = goal.target_amount && Number(goal.target_amount) > 0
    const pct = hasTarget
      ? Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100))
      : 0
    return (
      <li key={goal.id} className="bg-white p-4 rounded-lg">
        <div className="flex items-start gap-3">
          {editable && (
            <input
              type="checkbox"
              checked={goal.is_done}
              onChange={() => toggle(goal)}
              className="mt-1"
            />
          )}
          <div className="flex-1">
            <p className={goal.is_done ? 'line-through opacity-50' : 'font-medium'}>
              {goal.title}
            </p>
            <p className="text-xs opacity-60">{goal.category}</p>
          </div>
          {editable && (
            <button onClick={() => remove(goal.id)} className="text-sm opacity-60">
              ✕
            </button>
          )}
        </div>
        {hasTarget && (
          <div className="mt-3">
            <div className="h-2 bg-blush rounded-full overflow-hidden">
              <div className="h-2 bg-rose" style={{ width: pct + '%' }} />
            </div>
            <p className="text-xs opacity-60 mt-1">
              {Number(goal.saved_amount).toLocaleString()} of{' '}
              {Number(goal.target_amount).toLocaleString()} ({pct}%)
            </p>
            {editable && !goal.is_done && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Add amount"
                  value={amounts[goal.id] || ''}
                  onChange={(e) => setAmounts({ ...amounts, [goal.id]: e.target.value })}
                  className="flex-1 p-2 rounded-lg border border-rose text-sm"
                />
                <button
                  onClick={() => addSavings(goal)}
                  className="bg-rose text-white px-3 rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-rose mb-6">Our Goals</h1>
      <form onSubmit={addGoal} className="flex flex-col gap-3 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A goal, a plan, something to save for..."
          className="p-3 rounded-lg border border-rose"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-rose bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target (optional)"
            className="flex-1 p-3 rounded-lg border border-rose"
          />
        </div>
        <button type="submit" className="bg-rose text-white p-3 rounded-lg">
          Add goal
        </button>
      </form>
      <h2 className="text-xl font-semibold text-plum mb-3">My goals</h2>
      <ul className="flex flex-col gap-3 mb-8">
        {mine.map((g) => renderGoal(g, true))}
      </ul>
      {mine.length === 0 && <p className="text-sm opacity-60 mb-8">Nothing yet.</p>}
      <h2 className="text-xl font-semibold text-plum mb-3">Their goals</h2>
      <ul className="flex flex-col gap-3">
        {theirs.map((g) => renderGoal(g, false))}
      </ul>
      {theirs.length === 0 && <p className="text-sm opacity-60">Nothing yet.</p>}
    </main>
  )
}
