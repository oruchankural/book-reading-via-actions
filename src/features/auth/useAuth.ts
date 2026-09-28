import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { api } from '../../shared/api/client.ts'

export interface User {
  id: string
  email: string
  name: string
  picture: string | null
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  devLogin: boolean
  loginWithGoogle: UseMutationResult<User, Error, string>
  loginAsDev: UseMutationResult<User, Error, void>
  logout: UseMutationResult<void, Error, void>
}

const ME_KEY = ['me'] as const

export function useAuth(): AuthState {
  const qc = useQueryClient()

  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: () => api<{ user: User | null }>('/auth/me').then((r) => r.user),
    staleTime: Infinity,
  })
  const config = useQuery({
    queryKey: ['auth-config'],
    queryFn: () => api<{ devLogin: boolean }>('/auth/config'),
    staleTime: Infinity,
  })

  const onLoggedIn = (user: User): void => {
    qc.setQueryData(ME_KEY, user)
  }

  const loginWithGoogle = useMutation({
    mutationFn: (credential: string) =>
      api<{ user: User }>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }).then((r) => r.user),
    onSuccess: onLoggedIn,
  })

  const loginAsDev = useMutation({
    mutationFn: () => api<{ user: User }>('/auth/dev', { method: 'POST' }).then((r) => r.user),
    onSuccess: onLoggedIn,
  })

  const logout = useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      qc.setQueryData(ME_KEY, null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' && q.queryKey[0] !== 'auth-config' })
    },
  })

  return {
    user: me.data ?? null,
    isLoading: me.isPending,
    devLogin: config.data?.devLogin ?? false,
    loginWithGoogle,
    loginAsDev,
    logout,
  }
}
