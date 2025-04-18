import EngagementHubWrapper from './components/client-wrappers/EngagementHubWrapper';
import DirectoryCardWrapper from './components/client-wrappers/DirectoryCardWrapper';

export default function Home() {
  return (
    <main className="min-h-screen">
      <EngagementHubWrapper />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Campus Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DirectoryCardWrapper />
        </div>
      </div>
    </main>
  );
}