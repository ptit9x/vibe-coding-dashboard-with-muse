import { RouterProvider } from 'react-router-dom'

import { AuthProvider } from '@/app/auth-provider'
import { ThemeProvider } from '@/app/theme-provider'
import { router } from '@/app/router'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
