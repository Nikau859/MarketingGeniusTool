import { useState } from 'react'
import './App.css'
import MarketingAnalysisTool from './components/MarketingAnalysisTool'
import PayPalButton from './components/PayPalButton'

function App() {
  const [currentPage, setCurrentPage] = useState<'subscription' | 'analysis'>('subscription')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient font-display mb-4">
              Marketing Genius Tool
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Unlock the power of AI-driven marketing with our premium subscription
            </p>
          </div>
          <div id="theme-switcher-container" className="hidden md:block">
            {/* Theme switcher will be rendered here */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setCurrentPage('subscription')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                currentPage === 'subscription'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Subscribe
            </button>
            <button
              onClick={() => setCurrentPage('analysis')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                currentPage === 'analysis'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Analysis Tool
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto">
        {currentPage === 'subscription' ? (
          <>
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 slide-up">
              <div className="card-modern text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">Get intelligent marketing recommendations powered by advanced AI algorithms</p>
              </div>
              
              <div className="card-modern text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">Track performance with detailed analytics and actionable insights</p>
              </div>
              
              <div className="card-modern text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Support</h3>
                <p className="text-gray-600">Get priority support and exclusive access to new features</p>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="card-modern max-w-md mx-auto text-center slide-up">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Subscribe to Premium
                </h2>
                <p className="text-gray-600">
                  Get access to all premium features with our subscription plan
                </p>
              </div>
              
              {/* Pricing */}
              <div className="bg-gradient-primary text-white rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold mb-2">$20</div>
                <div className="text-lg opacity-90">per month</div>
              </div>
              
              <div className="space-y-6">
                <PayPalButton />
              </div>
            </div>
          </>
        ) : (
          <MarketingAnalysisTool />
        )}
      </div>
    </div>
  )
}

export default App
