import { Link } from 'react-router-dom'
import { useGSAP } from '../contexts/AnimationContext'
import { useEffect, useRef } from 'react'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const { animatePageEnter } = useGSAP()
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      animatePageEnter(containerRef.current)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12"
    >
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}