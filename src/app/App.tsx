import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage.tsx'
import { GOOGLE_CLIENT_ID } from '../features/auth/google.ts'
import { ProtectedRoute } from '../features/auth/ProtectedRoute.tsx'
import { BookDetailPage } from '../features/books/pages/BookDetailPage.tsx'
import { BookListPage } from '../features/books/pages/BookListPage.tsx'
import { AppLayout } from './AppLayout.tsx'

const ReaderPage = lazy(() =>
  import('../features/reader/pages/ReaderPage.tsx').then((m) => ({ default: m.ReaderPage })),
)

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false } },
})

export function App(): React.JSX.Element {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<BookListPage />} />
              <Route path="books/:id" element={<BookDetailPage />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="books/:id/read" element={
                  <Suspense fallback={null}>
                    <ReaderPage />
                  </Suspense>
                } />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
