'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/60 text-lg mb-8">Page not found</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
