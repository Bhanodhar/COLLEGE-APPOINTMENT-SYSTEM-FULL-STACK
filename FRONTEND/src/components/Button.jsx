import React from 'react'

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}
