'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function resizeImage(file, maxSize = 1600) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
    }
    img.src = url
  })
}

export default function Memories() {
  const [memories, setMemories] = useState([])
  const [urls, setUrls] = useState({})
  const [user, setUser] = useState(null)
  const [caption, setCaption] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [photo, setPhoto] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function loadMemories() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .order('happened_on', { ascending: false })
      .order('created_at', { ascending: false })
    const list = data || []
    setMemories(list)
    const paths = list.filter((m) => m.photo_path).map((m) => m.photo_path)
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from('memories')
        .createSignedUrls(paths, 3600)
      const signedList = signed || []
      const map = {}
      signedList.forEach((s) => {
        map[s.path] = s.signedUrl
      })
      setUrls(map)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      loadMemories()
    })
  }, [router])

  async function addMemory(e) {
    e.preventDefault()
    if (!caption.trim() && !photo) return
    setSaving(true)
    let photoPath = null
    if (photo) {
      const blob = await resizeImage(photo)
      photoPath = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg'
      const { error } = await supabase.storage
        .from('memories')
        .upload(photoPath, blob, { contentType: 'image/jpeg' })
      if (error) {
        setSaving(false)
        alert('Photo upload failed. Please try again.')
        return
      }
    }
    await supabase.from('memories').insert({
      caption: caption.trim(),
      photo_path: photoPath,
      happened_on: date,
      author: user.email,
    })
    setCaption('')
    setPhoto(null)
    setFileKey(fileKey + 1)
    setSaving(false)
    loadMemories()
  }

  async function remove(memory) {
    if (!confirm('Delete this memory?')) return
    if (memory.photo_path) {
      await supabase.storage.from('memories').remove([memory.photo_path])
    }
    await supabase.from('memories').delete().eq('id', memory.id)
    loadMemories()
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-rose mb-6">Our Memories</h1>
      <form onSubmit={addMemory} className="flex flex-col gap-3 mb-8">
        <input
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0] || null)}
          className="text-sm"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What happened? (optional)"
          rows={2}
          className="p-3 rounded-lg border border-rose"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 rounded-lg border border-rose bg-white"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-rose text-white p-3 rounded-lg"
        >
          {saving ? 'Saving...' : 'Save memory 📸'}
        </button>
      </form>
      <ul className="flex flex-col gap-4">
        {memories.map((m) => {
          const mine = user && m.author === user.email
          return (
            <li key={m.id} className="bg-white rounded-lg overflow-hidden">
              {m.photo_path && urls[m.photo_path] && (
                <img src={urls[m.photo_path]} alt="" className="w-full" />
              )}
              <div className="p-4">
                {m.caption && <p className="whitespace-pre-wrap">{m.caption}</p>}
                <div className="flex justify-between items-center mt-2 text-xs opacity-60">
                  <span>
                    {new Date(m.happened_on + 'T00:00:00').toLocaleDateString()} ·{' '}
                    {mine ? 'You' : 'Them'}
                  </span>
                  {mine && <button onClick={() => remove(m)}>Delete</button>}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {memories.length === 0 && (
        <p className="text-sm opacity-60">No memories yet. Add the first one 💕</p>
      )}
    </main>
  )
}
