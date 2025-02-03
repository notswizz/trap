import Typewriter from 'typewriter-effect';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <Typewriter
              options={{
                strings: [
                  'Welcome to MyApp',
                  'Your Journey Begins Here',
                  'Let Your Imagination Soar'
                ],
                autoStart: true,
                loop: true,
                delay: 75,
              }}
            />
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Start building something amazing today.
          </p>
        </div>
      </div>
    </div>
  );
} 