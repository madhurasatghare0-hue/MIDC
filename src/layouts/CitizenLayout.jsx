import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function CitizenLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Floating fixed sidebar (w-64 = 16rem, left-4 = 1rem) */}
      <Sidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* Content pushed right: 16rem sidebar + 1rem gap + 1rem space = 18rem */}
      <div className="flex min-h-screen flex-col lg:pl-[18rem]">
        <Header onToggleMobile={() => setMobileNavOpen((prev) => !prev)} />
        <main className="flex-1 px-4 pb-8 pt-4 lg:pl-2 lg:pr-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}