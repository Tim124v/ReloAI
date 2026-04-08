'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <p className="text-white/60 text-lg mb-8">Something went wrong</p>
        <button onClick={reset} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
