// Trackers list for high-speed DHT & peer discovery
const PUBLIC_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://explodie.org:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://9.rarbg.to:2920/announce',
  'udp://tracker.cyberia.is:6969/announce'
];

function generateMagnet(infoHash, name) {
  const trParams = PUBLIC_TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name || 'media-download')}${trParams}`;
}

function parseStreamItem(stream) {
  const nameHeader = stream.name || '';
  const titleBody = stream.title || '';
  const lines = titleBody.split('\n');

  const releaseTitle = lines[0] || (stream.behaviorHints && stream.behaviorHints.filename) || 'Direct Video Stream';

  // Extract seeders
  const seedMatch = titleBody.match(/👤\s*(\d+)/);
  const seeders = seedMatch ? parseInt(seedMatch[1], 10) : 0;

  // Extract size
  const sizeMatch = titleBody.match(/💾\s*([0-9.]+\s*[KMGT]B)/i);
  const size = sizeMatch ? sizeMatch[1].trim() : 'Unknown';

  // Extract source / tracker
  const trackerMatch = titleBody.match(/⚙️\s*([^\n\r]+)/);
  const tracker = trackerMatch ? trackerMatch[1].trim() : 'P2P Network';

  // Extract language flags & text
  const isHindi = /hindi|dubbed|dual audio|bollywood|🇮🇳/i.test(releaseTitle) || /🇮🇳/.test(titleBody);
  const isDualAudio = /dual audio|multi|multi-audio|dub/i.test(releaseTitle);
  const is4K = /2160p|4k|uhd/i.test(releaseTitle) || /4k/i.test(nameHeader);
  const is1080p = /1080p|fhd/i.test(releaseTitle) || /1080p/i.test(nameHeader);
  const is720p = /720p|hd/i.test(releaseTitle) || /720p/i.test(nameHeader);
  const is480p = /480p|sd/i.test(releaseTitle) || /480p/i.test(nameHeader);

  // Check if it's a complete season batch pack (All episodes in 1 pack / zip structure)
  const isSeasonBatch = /(complete|season\s*\d+|s\d+\s*batch|s\d+\s*pack|\b1-\d+\b|s0?\d+(?!\.?e\d+)|сезон)/i.test(releaseTitle) ||
    /batch|pack|complete/i.test(nameHeader) ||
    (stream.fileIdx !== undefined && stream.fileIdx > 0);

  // Determine quality tag
  let quality = 'HD';
  if (is4K) quality = '4K UHD';
  else if (is1080p) quality = '1080p FHD';
  else if (is720p) quality = '720p HD';
  else if (is480p) quality = '480p SD';

  // Codecs & formats
  const codecs = [];
  if (/av1/i.test(releaseTitle)) codecs.push('AV1');
  if (/hevc|x265|h265|10bit/i.test(releaseTitle)) codecs.push('HEVC 10-Bit');
  else if (/x264|h264/i.test(releaseTitle)) codecs.push('x264');
  if (/hdr/i.test(releaseTitle)) codecs.push('HDR10');
  if (/dv|dolby vision/i.test(releaseTitle)) codecs.push('Dolby Vision');
  if (/atmos/i.test(releaseTitle)) codecs.push('Dolby Atmos');
  if (/5\.1|7\.1/i.test(releaseTitle)) codecs.push('Surround 5.1');
  if (/bluray|bdrip/i.test(releaseTitle)) codecs.push('BluRay');
  else if (/web-dl|webrip/i.test(releaseTitle)) codecs.push('WEB-DL');

  const magnet = stream.infoHash ? generateMagnet(stream.infoHash, releaseTitle) : '';

  return {
    releaseTitle,
    rawName: nameHeader,
    infoHash: stream.infoHash,
    fileIdx: stream.fileIdx ?? 0,
    quality,
    size,
    seeders,
    tracker,
    isHindi,
    isDualAudio,
    isSeasonBatch,
    codecs,
    magnet,
    filename: (stream.behaviorHints && stream.behaviorHints.filename) || releaseTitle
  };
}

export async function fetchStreams(type, id, season, episode) {
  try {
    let url = '';
    if (type === 'movie') {
      url = `https://torrentio.strem.fun/stream/movie/${id}.json`;
    } else {
      url = `https://torrentio.strem.fun/stream/series/${id}:${season || 1}:${episode || 1}.json`;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return {
        streams: [],
        seasonPacks: [],
        singleEpisodes: [],
        categorized: { fourK: [], tenEightyP: [], sevenTwentyP: [], fourEightyP: [], dualAudioHindi: [] },
        seasonBatchCategorized: { fourK: [], tenEightyP: [], sevenTwentyP: [], fourEightyP: [], dualAudioHindi: [] }
      };
    }

    const data = await response.json();
    const rawStreams = data.streams || [];
    const parsed = rawStreams.map(parseStreamItem);

    // Grouping by quality & categories like Vegamovies / HDHub4u
    const categorized = {
      fourK: parsed.filter(s => s.quality === '4K UHD'),
      tenEightyP: parsed.filter(s => s.quality === '1080p FHD'),
      sevenTwentyP: parsed.filter(s => s.quality === '720p HD'),
      fourEightyP: parsed.filter(s => s.quality === '480p SD'),
      dualAudioHindi: parsed.filter(s => s.isHindi || s.isDualAudio)
    };

    // Separate Season Batch Packs (all episodes in one torrent) vs Single Episodes
    const seasonPacks = parsed.filter(s => s.isSeasonBatch);
    const singleEpisodes = parsed.filter(s => !s.isSeasonBatch);

    const seasonBatchCategorized = {
      fourK: seasonPacks.filter(s => s.quality === '4K UHD'),
      tenEightyP: seasonPacks.filter(s => s.quality === '1080p FHD'),
      sevenTwentyP: seasonPacks.filter(s => s.quality === '720p HD'),
      fourEightyP: seasonPacks.filter(s => s.quality === '480p SD'),
      dualAudioHindi: seasonPacks.filter(s => s.isHindi || s.isDualAudio)
    };

    return {
      streams: parsed,
      seasonPacks,
      singleEpisodes,
      categorized,
      seasonBatchCategorized,
      totalStreams: parsed.length,
      totalSeasonPacks: seasonPacks.length
    };
  } catch (err) {
    console.error('Error fetching torrentio streams:', err.message);
    return {
      streams: [],
      seasonPacks: [],
      singleEpisodes: [],
      categorized: { fourK: [], tenEightyP: [], sevenTwentyP: [], fourEightyP: [], dualAudioHindi: [] },
      seasonBatchCategorized: { fourK: [], tenEightyP: [], sevenTwentyP: [], fourEightyP: [], dualAudioHindi: [] }
    };
  }
}
