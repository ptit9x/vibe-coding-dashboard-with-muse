import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/app/theme-provider'
import { router } from '@/app/router'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
