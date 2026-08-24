import { useEffect, useState } from 'react';
import { IMAGE_BASE_URL, fetchStreamingProviders, PROVIDER_URLS } from '../api/tmdb';

export default function ProviderSection() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreamingProviders()
      .then((data) => {
        const topProviders = (data.results || []).slice(0, 16);
        setProviders(topProviders);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load streaming networks:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="my-12 px-3 sm:px-8 md:px-14">
        <h3 className="text-lg sm:text-2xl font-extrabold text-white mb-4">
          Watch Across Streaming Networks
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-48 bg-brand-surface rounded-xl animate-pulse shrink-0"
            />
          ))}
        </div>
      </section>
    );
  }

  if (providers.length === 0) return null;

  return (
    <section className="my-12 px-3 sm:px-8 md:px-14">
      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
          Watch Across Streaming Networks
        </h3>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Official Direct Portals
        </span>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
        {providers.map((provider) => {
          const targetUrl =
            PROVIDER_URLS[provider.provider_name] ||
            `https://www.themoviedb.org/watch`;

          return (
            <a
              key={provider.provider_id}
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-brand-surface hover:bg-brand-card border border-white/10 hover:border-brand-red px-4 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-red-950/30"
              title={`Visit ${provider.provider_name}`}
            >
              <img
                src={`${IMAGE_BASE_URL}/w92${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-8 h-8 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {provider.provider_name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium group-hover:text-red-400 transition-colors">
                  Stream Now →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
