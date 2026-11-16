import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      <div className="flex min-h-screen flex-col lg:pl-[18rem]">
        <Header onToggleMobile={() => setMobileNavOpen((prev) => !prev)} />
        <main className="flex-1 px-4 pb-8 pt-4 lg:pl-2 lg:pr-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}