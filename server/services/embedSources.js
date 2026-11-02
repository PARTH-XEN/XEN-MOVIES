export function getEmbedServers(type, id, season = 1, episode = 1, tmdbId = null) {
  const isMovie = type === 'movie';
  const s = parseInt(season, 10) || 1;
  const e = parseInt(episode, 10) || 1;
  const effectiveImdbId = id;
  const effectiveTmdbId = tmdbId || id;

  return [
    {
      id: '2embed',
      name: '2Embed VIP [Auto-Play / Subs]',
      badge: 'High Reliability',
      url: isMovie
        ? `https://www.2embed.cc/embed/${effectiveImdbId}`
        : `https://www.2embed.cc/embedtv/${effectiveImdbId}&s=${s}&e=${e}`
    },
    {
      id: 'vidsrc_pm',
      name: 'VidSrc PM [HD Direct]',
      badge: 'Multi-Audio',
      url: isMovie
        ? `https://vidsrc.pm/embed/movie/${effectiveImdbId}`
        : `https://vidsrc.pm/embed/tv/${effectiveImdbId}/${s}/${e}`
    },
    {
      id: 'vidlink',
      name: 'VidLink Pro [4K UHD]',
      badge: 'Ultra HD',
      url: isMovie 
        ? `https://vidlink.pro/movie/${effectiveImdbId}?primaryColor=a855f7&secondaryColor=06b6d4&iconColor=38bdf8`
        : `https://vidlink.pro/tv/${effectiveTmdbId}/${s}/${e}?primaryColor=a855f7&secondaryColor=06b6d4&iconColor=38bdf8`
    },
    {
      id: 'autoembed',
      name: 'AutoEmbed [Cloud CDN]',
      badge: 'Fast Mirror',
      url: isMovie
        ? `https://autoembed.co/movie/imdb/${effectiveImdbId}`
        : `https://autoembed.co/tv/imdb/${effectiveImdbId}-${s}-${e}`
    },
    {
      id: 'smashystream',
      name: 'Smashy Stream',
      badge: 'High Speed',
      url: isMovie
        ? `https://player.smashy.stream/movie/${effectiveImdbId}`
        : `https://player.smashy.stream/tv/${effectiveImdbId}?s=${s}&e=${e}`
    },
    {
      id: 'multiembed',
      name: 'MultiEmbed Global',
      badge: 'Universal Backup',
      url: isMovie
        ? `https://multiembed.mov/?video_id=${effectiveImdbId}`
        : `https://multiembed.mov/?video_id=${effectiveImdbId}&s=${s}&e=${e}`
    }
  ];
}
