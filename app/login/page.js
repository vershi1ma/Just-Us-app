'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    await supabase.auth.signInWithOtp({ email })
    setSent(true)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-rose mb-6">Just Us</h1>
      {sent ? (
        <p className="text-plum">Check your email for a login link 💌</p>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border border-rose"
            required
          />
          <button type="submit" className="bg-rose text-white p-3 rounded-lg">
            Send me a login link
          </button>
        </form>
      )}
    </main>
  )
}
