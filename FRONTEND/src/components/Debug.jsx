export default function Debug() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Debug Test</h1>
        <p className="text-gray-600 mb-8">If you see this, React is working!</p>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-green-600 font-medium">✓ React is running</p>
          <p className="text-green-600 font-medium">✓ Vite is working</p>
          <p className="text-green-600 font-medium">✓ Tailwind is loaded</p>
        </div>
      </div>
    </div>
  )
}