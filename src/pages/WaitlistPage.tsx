import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Leaf, Users, Shield, Zap } from 'lucide-react';

const WaitlistPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xyzdrjny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        addToast('Successfully joined the waitlist! We\'ll be in touch soon.', 'success');
        setFormData({ email: '', name: '', role: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      addToast('Failed to join waitlist. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join the <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">GreenLedger</span> Revolution
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to experience blockchain-powered agricultural supply chain tracking. 
            Transparent, secure, and sustainable farming for the future.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Blockchain Security</h3>
            <p className="text-gray-600">Immutable records ensure complete transparency</p>
          </div>
          <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multi-Role Platform</h3>
            <p className="text-gray-600">Farmers, transporters, and buyers united</p>
          </div>
          <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
            <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">Track your produce from farm to table</p>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Join Our Waitlist
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role (Optional)
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select your role</option>
                <option value="farmer">Farmer</option>
                <option value="transporter">Transporter</option>
                <option value="buyer">Buyer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.email}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            We'll never spam you. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;