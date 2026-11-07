export function getEmbedServers(type, id, season = 1, episode = 1, tmdbId = null) {
  const isMovie = type === 'movie';
  const s = parseInt(season, 10) || 1;
  const e = parseInt(episode, 10) || 1;
  const effectiveImdbId = id;
  const effectiveTmdbId = tmdbId || id;

  return [
    {
      id: 'vidlink',
      name: 'VidLink 4K',
      badge: '4K UHD',
      url: isMovie 
        ? `https://vidlink.pro/movie/${effectiveTmdbId || effectiveImdbId}?primaryColor=f59e0b&secondaryColor=10b981&iconColor=f59e0b`
        : `https://vidlink.pro/tv/${effectiveTmdbId || effectiveImdbId}/${s}/${e}?primaryColor=f59e0b&secondaryColor=10b981&iconColor=f59e0b`
    },
    {
      id: 'vidsrc_su',
      name: 'VidSrc Ultra',
      badge: '4K Ultra',
      url: isMovie
        ? `https://vidsrc.su/embed/movie/${effectiveImdbId}`
        : `https://vidsrc.su/embed/tv/${effectiveTmdbId || effectiveImdbId}/${s}/${e}`
    },
    {
      id: 'autoembed',
      name: 'AutoEmbed 4K',
      badge: '4K Cloud CDN',
      url: isMovie
        ? `https://autoembed.me/movie/imdb/${effectiveImdbId}`
        : `https://autoembed.me/tv/imdb/${effectiveImdbId}-${s}-${e}`
    },
    {
      id: '2embed',
      name: '2Embed VIP',
      badge: 'Auto-Play',
      url: isMovie
        ? `https://www.2embed.cc/embed/${effectiveImdbId}`
        : `https://www.2embed.cc/embedtv/${effectiveImdbId}?s=${s}&e=${e}`
    },
    {
      id: 'vidsrc_pm',
      name: 'VidSrc PM',
      badge: 'Multi-Audio',
      url: isMovie
        ? `https://vidsrc.pm/embed/movie/${effectiveImdbId}`
        : `https://vidsrc.pm/embed/tv/${effectiveImdbId}/${s}/${e}`
    },
    {
      id: 'movies111',
      name: '111Movies',
      badge: 'Fast Mirror',
      url: isMovie
        ? `https://111movies.com/movie/${effectiveImdbId}`
        : `https://111movies.com/tv/${effectiveTmdbId || effectiveImdbId}/${s}/${e}`
    },
    {
      id: 'vidsrc_work',
      name: 'VidSrc Work',
      badge: 'Universal Backup',
      url: isMovie
        ? `https://vidsrc.work/embed/movie/${effectiveTmdbId || effectiveImdbId}`
        : `https://vidsrc.work/embed/tv/${effectiveTmdbId || effectiveImdbId}/${s}/${e}`
    }
  ];
}
