import React from 'react'

export default function Input({ label, type = 'text', value, onChange, name, placeholder, required }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
    </div>
  )
}
