'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signIn, signUp } from './actions'
import type { AuthState } from './actions'

type Mode = 'signin' | 'signup'

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [signInState, signInAction] = useActionState(signIn, null)
  const [signUpState, signUpAction] = useActionState(signUp, null)

  const isSignIn = mode === 'signin'
  const state: AuthState = isSignIn ? signInState : signUpState

  return (
    <div>
      {/* Tabs */}
      <div className="flex rounded-xl bg-elevated border border-border p-1 mb-6">
        <TabButton active={isSignIn} onClick={() => setMode('signin')}>Sign in</TabButton>
        <TabButton active={!isSignIn} onClick={() => setMode('signup')}>Create account</TabButton>
      </div>

      {/* Error alert */}
      {state && 'error' in state && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-danger/8 border border-danger/20 text-danger text-sm">
          {state.error}
        </div>
      )}

      {/* Sign-up success */}
      {!isSignIn && state && 'success' in state ? (
        <div className="text-center py-6 animate-fade-in">
          <div className="text-4xl mb-3">✉️</div>
          <p className="text-sm font-semibold text-t1 mb-1">Check your inbox</p>
          <p className="text-sm text-t2">We sent a confirmation link to your email address.</p>
        </div>
      ) : (
        <form action={isSignIn ? signInAction : signUpAction} className="space-y-4" key={mode}>
          <Field id="email" label="Email" type="email" name="email" placeholder="you@example.com" />
          <Field
            id="password"
            label="Password"
            type="password"
            name="password"
            placeholder={isSignIn ? '••••••••' : 'Min. 6 characters'}
          />
          <SubmitButton label={isSignIn ? 'Sign in' : 'Create account'} />
          {isSignIn && (
            <p className="text-center text-xs text-t3 pt-1">
              New here?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-accent hover:underline font-medium"
              >
                Create an account
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
        active
          ? 'bg-bg text-t1 shadow-sm border border-border'
          : 'text-t3 hover:text-t2'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  id,
  label,
  type,
  name,
  placeholder,
}: {
  id: string
  label: string
  type: string
  name: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder:text-t3 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-colors duration-150"
      />
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all duration-150 shadow-md shadow-accent/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
          Loading…
        </span>
      ) : (
        label
      )}
    </button>
  )
}
