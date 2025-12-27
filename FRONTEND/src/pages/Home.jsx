import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, Users, Shield, ArrowRight } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments with professors in just a few clicks',
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Professors can manage their availability efficiently',
    },
    {
      icon: Users,
      title: 'Role-based Access',
      description: 'Different interfaces for students and professors',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with industry-standard security',
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
          Welcome to{' '}
          <span className="text-primary-600">College Appointment System</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your academic appointments with our easy-to-use platform.
          Connect students and professors seamlessly.
        </p>
        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center justify-center text-lg px-8 py-3"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-3"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center justify-center text-lg px-8 py-3"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Platform?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to streamline your appointments?
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Join hundreds of students and professors who are already using our
          platform to manage their academic schedules efficiently.
        </p>
        {!user && (
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Create Free Account
          </Link>
        )}
      </div>
    </div>
  )
}