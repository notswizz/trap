import React from 'react';

export default function OGImage() {
  return (
    <div className="w-[1200px] h-[630px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-20">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 w-full h-full flex flex-col items-center justify-center border border-white/20">
        <h1 className="text-7xl font-bold text-white mb-8">
          gptSILK
        </h1>
        <p className="text-3xl text-white/90 text-center max-w-3xl">
          AI-Powered Marketplace: Create, Trade, and Innovate
        </p>
        <div className="mt-12 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            {/* Icon 1 */}
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            {/* Icon 2 */}
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            {/* Icon 3 */}
          </div>
        </div>
      </div>
    </div>
  );
} 