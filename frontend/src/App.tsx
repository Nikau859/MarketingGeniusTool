import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PayPalSubscriptionButton from './components/PayPalSubscriptionButton'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Subscribe to Premium
        </h1>
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            Get access to all premium features with our subscription plan
          </p>
          <PayPalSubscriptionButton />
        </div>
      </div>
    </div>
  )
}

export default App
