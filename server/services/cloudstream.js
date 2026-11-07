import { getEmbedServers } from './embedSources.js';
import { fetchStreams } from './torrentio.js';
import { fetchMeta } from './cinemeta.js';

export function getCloudstreamProviders() {
  return [
    {
      id: 'sorastream',
      name: 'Cloudstream SoraStream',
      tag: 'Flagship Multi-Source',
      speed: 'Ultra Fast',
      features: ['Auto-fallback', 'Subtitles', '1080p FHD']
    },
    {
      id: 'superstream',
      name: 'Cloudstream SuperStream VIP',
      tag: 'Direct 4K / VIP',
      speed: 'High Speed',
      features: ['High Bandwidth', 'No Ads', '4K Support']
    },
    {
      id: 'twoembed',
      name: 'Cloudstream 2Embed Pro',
      tag: 'Multi-Language',
      speed: 'Fast',
      features: ['Multi-Audio', 'Multi-Subs', '720p/1080p']
    },
    {
      id: 'vegamirror',
      name: 'Cloudstream Vegamovies Mirror',
      tag: 'Hindi Dubbed / Dual Audio',
      speed: 'Fast CDN',
      features: ['Dual Audio', 'Indian Cinema', 'Fast Mirror']
    }
  ];
}

export async function resolveCloudstreamSources(type, id, season = 1, episode = 1) {
  const isMovie = type === 'movie';
  const meta = await fetchMeta(type, id);
  const tmdbId = meta?.moviedb_id || null;

  // 1. Cloudstream Embed Streams
  const embedServers = getEmbedServers(type, id, season, episode, tmdbId);

  const cloudstreamSources = [
    {
      name: 'Cloudstream SoraStream [VIP 1080p]',
      url: embedServers.find(s => s.id === 'vidlink')?.url || `https://vidlink.pro/${isMovie ? 'movie' : 'tv'}/${id}${isMovie ? '' : `/${season}/${episode}`}`,
      quality: '1080p',
      isM3U8: false,
      provider: 'SoraStream',
      flag: '⚡ Recommended'
    },
    {
      name: 'Cloudstream SuperStream [Multi-Subtitles]',
      url: embedServers.find(s => s.id === '2embed')?.url || `https://www.2embed.cc/${isMovie ? 'embed' : 'embedtv'}/${id}${isMovie ? '' : `&s=${season}&e=${episode}`}`,
      quality: '1080p',
      isM3U8: false,
      provider: 'SuperStream',
      flag: '💬 Subtitles'
    },
    {
      name: 'Cloudstream Vegamovies / Hindi Dubbed Mirror',
      url: embedServers.find(s => s.id === 'vidsrc_icu')?.url || embedServers[0]?.url,
      quality: '720p / 1080p',
      isM3U8: false,
      provider: 'VegaMirror',
      flag: '🇮🇳 Dual Audio'
    },
    {
      name: 'Cloudstream Auto-Switch Mirror',
      url: embedServers.find(s => s.id === 'autoembed')?.url || embedServers[0]?.url,
      quality: 'Auto',
      isM3U8: false,
      provider: 'AutoSwitch',
      flag: '🔄 Backup'
    }
  ];

  // 2. Fetch P2P / Direct Magnet streams from Torrentio
  const torrentData = await fetchStreams(type, id, season, episode);
  const downloadSources = (torrentData.streams || []).slice(0, 10).map(stream => ({
    name: stream.releaseTitle,
    quality: stream.quality,
    size: stream.size,
    seeders: stream.seeders,
    magnet: stream.magnet,
    infoHash: stream.infoHash,
    isHindi: stream.isHindi
  }));

  // 3. Construct Cloudstream deep link for mobile/PC Cloudstream app
  // Format: cloudstream://watch?id=...&type=...
  const deepLink = `cloudstream://watch?id=${encodeURIComponent(id)}&type=${type}&s=${season}&e=${episode}&title=${encodeURIComponent(meta?.name || 'media')}`;

  return {
    success: true,
    engine: 'Cloudstream 3 API Engine',
    mediaId: id,
    title: meta?.name || 'Media',
    type,
    season: isMovie ? null : season,
    episode: isMovie ? null : episode,
    deepLink,
    cloudstreamSources,
    downloadSources,
    meta: {
      name: meta?.name,
      year: meta?.year,
      poster: meta?.poster,
      backdrop: meta?.background || meta?.poster,
      imdbRating: meta?.imdbRating,
      genres: meta?.genres
    }
  };
}

// Generates Cloudstream-compatible Repository Manifest
export function getCloudstreamRepo(baseUrl = 'https://xenmovies.antideploy.app') {
  return {
    name: 'XENMOVIES Official Repository',
    description: 'Official XENMOVIES companion repository for Cloudstream 3. Stream 4K Cinema, Multi-Audio Hindi, Netflix Series, Anime & Vegamovies with zero ads.',
    manifestVersion: 1,
    pluginVersion: 1,
    url: `${baseUrl}/repo.json`,
    rawUrl: `${baseUrl}/repo.json`,
    iconUrl: `${baseUrl}/LOGO/XEN-MOVIES.png`,
    pluginLists: [
      `${baseUrl}/plugins.json`,
      'https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json',
      'https://raw.githubusercontent.com/stormunbl/Stormunbl-Repository/builds/plugins.json'
    ],
    plugins: [
      {
        id: 'xenmovies.sorastream',
        name: 'XENMOVIES SoraStream 4K',
        internalName: 'XENMOVIES_SoraStream',
        version: 1,
        author: 'XENMOVIES Team',
        description: 'Multi-server ultra-fast streaming engine with subtitles and 4K HDR support',
        status: 1,
        tvTypes: ['movie', 'tv', 'anime'],
        types: ['Movie', 'TvSeries', 'Anime', 'Cartoon'],
        apiVersion: 1,
        iconUrl: `${baseUrl}/LOGO/XEN-MOVIES.png`,
        url: `${baseUrl}/plugins/sorastream.cs3`
      },
      {
        id: 'xenmovies.vegamovies',
        name: 'XENMOVIES Vegamovies Engine',
        internalName: 'XENMOVIES_Vegamovies',
        version: 1,
        author: 'XENMOVIES Team',
        description: 'Hindi Dubbed and Dual Audio movie streaming and direct batch downloads',
        status: 1,
        tvTypes: ['movie', 'tv'],
        types: ['Movie', 'TvSeries', 'AsianDrama', 'Bollywood'],
        apiVersion: 1,
        iconUrl: `${baseUrl}/LOGO/XEN-MOVIES.png`,
        url: `${baseUrl}/plugins/vegamovies.cs3`
      },
      {
        id: 'xenmovies.anime',
        name: 'XENMOVIES Anime & Series Hub',
        internalName: 'XENMOVIES_AnimeHub',
        version: 1,
        author: 'XENMOVIES Team',
        description: 'Subbed & Dubbed Anime and trending international television series',
        status: 1,
        tvTypes: ['anime', 'tv'],
        types: ['Anime', 'TvSeries', 'Cartoon'],
        apiVersion: 1,
        iconUrl: `${baseUrl}/LOGO/XEN-MOVIES.png`,
        url: `${baseUrl}/plugins/anime.cs3`
      }
    ]
  };
}

export function getCloudstreamPlugins(baseUrl = 'https://xenmovies.antideploy.app') {
  const repo = getCloudstreamRepo(baseUrl);
  return repo.plugins;
}

