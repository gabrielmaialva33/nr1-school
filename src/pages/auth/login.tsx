import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loginWithPassword } from '@/services/auth'

const DEADLINE = new Date('2026-05-26T00:00:00-03:00').getTime()

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, DEADLINE - now)
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-bold tabular-nums text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const countdown = useCountdown()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginWithPassword({ email, password })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Erro ao fazer login')
        return
      }

      navigate('/')
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-screen">
      {/* Left — Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#f97316]">
              <Shield className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              NR1 <span className="text-[#f97316]">School</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#0f172a]">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Entre na sua conta para gerenciar riscos psicossociais
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-[#0f172a]">Senha</label>
                <a href="#" className="text-xs text-[#f97316] hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-[#f97316] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]',
                loading && 'opacity-70 cursor-not-allowed',
              )}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-xs text-[#64748b]">
              Demo: <span className="font-mono">ana.mendes@mariahelena.demo.br</span> / <span className="font-mono">demo123</span>
            </p>
          </form>
        </div>
      </div>

      {/* Right — Branding + Countdown */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-[#0f172a] px-12 lg:flex">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-[#f97316]/10">
          <Shield className="size-10 text-[#f97316]" />
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-white">
          NR1 <span className="text-[#f97316]">School</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Gestão de Riscos Psicossociais em Escolas
        </p>

        {/* Countdown */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm">
          <div className="flex items-center gap-5">
            <CountdownUnit value={countdown.days} label="dias" />
            <span className="text-2xl font-light text-slate-500">:</span>
            <CountdownUnit value={countdown.hours} label="horas" />
            <span className="text-2xl font-light text-slate-500">:</span>
            <CountdownUnit value={countdown.minutes} label="min" />
            <span className="text-2xl font-light text-slate-500">:</span>
            <CountdownUnit value={countdown.seconds} label="seg" />
          </div>
        </div>

        <p className="mt-4 text-center text-xs font-medium uppercase tracking-wider text-[#f97316]">
          Início da fiscalização punitiva NR-1
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          26 de maio de 2026 — Portaria MTE nº 1.419/2024
        </p>
      </div>
    </div>
  )
}
