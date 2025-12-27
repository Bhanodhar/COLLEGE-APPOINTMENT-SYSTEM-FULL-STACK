import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-sm text-slate-600">
      <div className="container mx-auto">© {new Date().getFullYear()} College Appointment System — Built with ❤️</div>
    </footer>
  )
}
