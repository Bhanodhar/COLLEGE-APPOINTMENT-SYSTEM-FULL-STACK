import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

export default function Hero() {
  const root = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { y: -20, opacity: 0, duration: 0.8, stagger: 0.1 })
      gsap.from('.hero-sub', { y: 10, opacity: 0, duration: 0.8, delay: 0.3 })
      gsap.from('.hero-cta', { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.5, stagger: 0.12 })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden pt-12 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="hero-title text-4xl md:text-5xl font-extrabold leading-tight text-sky-900">College Appointment System</h1>
            <p className="hero-sub mt-4 text-lg text-slate-700">Easy booking and availability management for students and professors. Fast, secure and built for your campus.</p>

            <div className="mt-6 flex gap-3">
              <Link to="/register" className="hero-cta inline-block px-5 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg shadow">Get Started</Link>
              <Link to="/login" className="hero-cta inline-block px-4 py-3 border border-slate-200 rounded-lg text-slate-800">Sign In</Link>
            </div>
          </div>

          <div className="relative">
            <div className="w-full bg-white rounded-2xl shadow-xl p-6">
              <div className="text-sm text-slate-500">Example availability</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Dr. A. Sharma</div>
                    <div className="text-xs text-slate-500">Computer Science</div>
                  </div>
                  <div className="text-sm text-green-600">Available • 10:00 AM</div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Prof. R. Singh</div>
                    <div className="text-xs text-slate-500">Mathematics</div>
                  </div>
                  <div className="text-sm text-red-600">Booked • 11:00 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <svg className="absolute right-0 bottom-0 opacity-20" width="420" height="420" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="210" cy="210" r="210" fill="url(#g)"/>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
      </svg>
    </section>
  )
}
