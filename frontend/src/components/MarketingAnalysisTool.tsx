import { useState } from 'react';

interface AnalysisResult {
  keywords: string[];
  industry: string;
  business_size: string;
  campaign: {
    ad_copy: Array<{
      headline: string;
      description: string;
      cta: string;
    }>;
    image_prompt: string;
    channels: string[];
    targeting: {
      age_range: [number, number];
      interests: string[];
      geo: string;
    };
  };
  strategy: string;
  social_ideas: Record<string, string[]>;
  performance: {
    CTR: string;
    CPC: string;
    'Conversion Rate': string;
  };
  ab_variations: Array<{
    headline: string;
    description: string;
    cta: string;
  }>;
  budget_allocation: Record<string, number>;
  schedule: {
    best_days: string[];
    best_hours: string[];
  };
  alerts: string[];
  roi: {
    Spend: string;
    Conversions: number;
    Revenue: string;
    ROAS: number;
  };
  content_recommendations: string[];
}

const MarketingAnalysisTool = () => {
  const [url, setUrl] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid website URL');
      return;
    }

    // Check if email is stored in localStorage
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      setShowEmailModal(true);
      return;
    }

    await performAnalysis(storedEmail);
  };

  const performAnalysis = async (userEmail: string) => {
    setIsLoading(true);
    setError('');
    setResults(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: url.trim(),
          employee_count: employeeCount ? parseInt(employeeCount) : undefined,
          email: userEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        setShowEmailModal(false);
      } else {
        setError(data.message || data.error || 'Failed to analyze website');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        setShowEmailModal(false);
        await performAnalysis(email.trim());
      } else {
        setError(data.error || 'Failed to start trial');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Analysis Form */}
      <div className="card-modern mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Marketing Analysis Tool
          </h2>
          <p className="text-gray-600">
            Get AI-powered marketing insights for your website
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-modern"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees (Optional)
            </label>
            <input
              type="number"
              id="employeeCount"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              className="input-modern"
              placeholder="Enter number of employees"
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Website'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Start Your Free Trial</h3>
            <p className="text-gray-600 mb-4">
              Enter your email to start a 7-day free trial and access the marketing analysis tool.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-modern mb-4"
              placeholder="your@email.com"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleEmailSubmit}
                className="btn-primary flex-1"
              >
                Start Trial
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Overview */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Analysis Overview</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {results.industry.charAt(0).toUpperCase() + results.industry.slice(1)}
                </div>
                <div className="text-gray-600">Industry</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-2">
                  {results.business_size.charAt(0).toUpperCase() + results.business_size.slice(1)}
                </div>
                <div className="text-gray-600">Business Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {results.keywords.length}
                </div>
                <div className="text-gray-600">Keywords Found</div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {results.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Marketing Strategy</h3>
            <p className="text-gray-700 leading-relaxed">{results.strategy}</p>
          </div>

          {/* Campaign Details */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Campaign Details</h3>
            
            {/* Ad Copy */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Ad Copy Variations</h4>
              <div className="space-y-4">
                {results.campaign.ad_copy.map((ad, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-1">{ad.headline}</div>
                    <div className="text-gray-600 mb-2">{ad.description}</div>
                    <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {ad.cta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeting */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Targeting</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Age Range</div>
                  <div className="font-medium">{results.campaign.targeting.age_range[0]} - {results.campaign.targeting.age_range[1]} years</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Channels</div>
                  <div className="flex flex-wrap gap-1">
                    {results.campaign.channels.map((channel, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Prompt */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Image Prompt</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 italic">{results.campaign.image_prompt}</p>
              </div>
            </div>
          </div>

          {/* Performance Predictions */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Predictions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(results.performance).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">{value}</div>
                  <div className="text-gray-600">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Dashboard */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">ROI Dashboard</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{results.roi.Spend}</div>
                <div className="text-gray-600">Spend</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{results.roi.Conversions}</div>
                <div className="text-gray-600">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{results.roi.Revenue}</div>
                <div className="text-gray-600">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{results.roi.ROAS}x</div>
                <div className="text-gray-600">ROAS</div>
              </div>
            </div>
          </div>

          {/* Social Media Ideas */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Social Media Content Ideas</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(results.social_ideas).map(([platform, ideas]) => (
                <div key={platform} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{platform}</h4>
                  <ul className="space-y-2">
                    {ideas.slice(0, 3).map((idea, index) => (
                      <li key={index} className="text-sm text-gray-700">• {idea}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Content Recommendations */}
          <div className="card-modern">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Content Strategy Recommendations</h3>
            <ul className="space-y-2">
              {results.content_recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts */}
          {results.alerts.length > 0 && (
            <div className="card-modern border-l-4 border-yellow-400 bg-yellow-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Campaign Alerts</h3>
              <ul className="space-y-2">
                {results.alerts.map((alert, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketingAnalysisTool; 