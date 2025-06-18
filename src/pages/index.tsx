import React from 'react';
import PayPalSubscriptionButton from '../components/PayPalSubscriptionButton';

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscribe to Premium</h1>
      <PayPalSubscriptionButton />
    </div>
  );
} 