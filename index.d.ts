interface TorrentQuery {
  anilistId: number // anilist anime id
  anidbAid?: number // anidb anime id
  anidbEid?: number // anidb episode id
  tvdbId?: number // thetvdb anime id
  tvdbEId?: number // thetvdb episode id
  imdbId?: string // imdb id
  tmdbId?: number // tmdb anime id
  titles: string[] // list of titles and alternative titles
  episode?: number
  episodeCount?: number // total episode count for the series
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''
  exclusions: string[] // list of keywords to exclude from searches, this might be unsupported codecs (e.g., "x265"), sources (e.g., "web-dl"), or other keywords (e.g., "uncensored")
  type?: 'sub' | 'dub',
  fetch: typeof globalThis.fetch // fetch function to perform network requests, this function should be used instead of the global fetch to ensure CORS requests work properly
}

interface TorrentResult {
  title: string // torrent title
  link: string // link to .torrent file, or magnet link or infoHash
  id?: number
  seeders: number
  leechers: number
  downloads: number
  accuracy: 'high' | 'medium' | 'low'
  hash: string // info hash
  size: number // size in bytes
  date: Date // date the torrent was uploaded
  type?: 'batch' | 'best' | 'alt'
}

export type SearchFunction = (query: TorrentQuery, options?: {
  [key: string]: {
    type: 'string' | 'number' | 'boolean'
    description: string
    default: any
  }
}) => Promise<TorrentResult[]>

export class TorrentSource {
  test: () => Promise<boolean>
  single: SearchFunction
  batch: SearchFunction
  movie: SearchFunction
}
