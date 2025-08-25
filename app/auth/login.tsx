
'use client'

import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Poppins in globals.css:
// @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
// html, body { font-family: 'Poppins', sans-serif; }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://nvccz-pi.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: any = null
      try {
        data = await response.json()
      } catch {
        /* non-JSON */
      }

      if (!response.ok) {
        const message = (data && (data.message || data.error)) || 'Login failed'
        throw new Error(message)
      }

      if (data?.success && data?.token && data?.user?.id) {
        sessionStorage.setItem('token', data.token)
        console.log(data.token)
        sessionStorage.setItem('userID', String(data.user.id))
        router.push('/')
        return
      }

      throw new Error(data?.message || 'Unexpected response from server')
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ===== Background Layer (kept from original) ===== */}
      <div className="relative min-h-screen overflow-hidden font-poppins">
        {/* BG image with subtle zoom/fade */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 -z-10"
        >
          <Image
            src="/login/bg-login.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Blue/Gray gradient overlay (kept colors) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.8 }}
          style={{
            background:
              'linear-gradient(135deg, rgba(0,86,164,0.45), rgba(203,213,225,0.55))',
          }}
        />

        {/* Radial accents with slow ambient movement (kept) */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none animate-slow-shift"
          style={{
            background:
              'radial-gradient(1200px 600px at 80% 20%, rgba(0,86,164,0.18), transparent 60%), radial-gradient(1000px 500px at 10% 90%, rgba(148,163,184,0.22), transparent 60%)',
          }}
        />

        {/* ===== Content Layer ===== */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div
              className="rounded-2xl border border-black/10 bg-white/90 p-8 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md"
            >
              <div className="mb-8 text-center">
                <h1 className="mb-1 text-4xl font-light tracking-wide text-black">
                  Sign in
                </h1>
                <p className="text-base font-light text-gray-700">
                  Use your NVCCZ credentials
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label htmlFor="email" className="mb-1 block text-sm font-light text-black">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Mail className="h-5 w-5 text-gray-500" aria-hidden />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white/80 py-3 pl-10 pr-3 text-black placeholder-gray-500 shadow-sm outline-none transition focus:border-[#0056A4] focus:ring-4 focus:ring-[#0056A4]/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label htmlFor="password" className="mb-1 block text-sm font-light text-black">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-500" aria-hidden />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white/80 py-3 pl-10 pr-12 text-black placeholder-gray-500 shadow-sm outline-none transition focus:border-[#0056A4] focus:ring-4 focus:ring-[#0056A4]/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 font-light text-gray-700">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#0056A4] focus:ring-[#0056A4]" />
                    Remember me
                  </label>
                  <Link href="/auth/forgot" className="font-medium text-[#0056A4] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Button */}
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0056A4] px-4 py-3 text-base font-semibold text-white shadow-[0_8px_30px_rgb(0,86,164,0.45)] transition hover:bg-[#064f94] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0056A4]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>Sign in</>
                  )}
                </motion.button>
              </form>

              {/* No signup link as requested */}
            </div>
          </motion.div>
        </div>

        {/* Local styles for background animation (kept) */}
        <style jsx>{`
          @keyframes slowShift {
            0%   { transform: translate3d(0,0,0); }
            50%  { transform: translate3d(-1.5%, -1.5%, 0); }
            100% { transform: translate3d(0,0,0); }
          }
          .animate-slow-shift {
            animation: slowShift 18s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  )
}
