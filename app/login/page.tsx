import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './auth-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none bg-accent/5 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full pointer-events-none bg-accent-2/5 blur-3xl" />

      <div className="w-full max-w-sm animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <span className="text-xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-t1 tracking-tight">SRS English</h1>
          <p className="text-sm text-t2 mt-1.5">Your personal vocabulary trainer</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg shadow-t1/5">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
