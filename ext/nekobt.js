
/**
 * @typedef {import('../').TorrentSource} TorrentSource
 */

/**
 * @implements {TorrentSource}
 */
export default new class NekoBT {
  url = atob('aHR0cHM6Ly9uZWtvYnQudG8vYXBpL3Yx')

  buildQuery(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`
    return query
  }

  async searchMedia(title) {
    const fetchUrl = `${this.url}/media/search?query=${encodeURIComponent(title)}`

    const res = await fetch(fetchUrl)
    const data = await res.json()

    if (data.error) return null

    /**@type {any[]}*/
    const results = data.data.results

    if (!results.length) return null

    const media = results[0]

    // TODO: maybe use TVDB ID as well to validate?
    return media.id
  }

  async getMedia(mediaId) {
    const fetchUrl = `${this.url}/media/${mediaId}`

    const res = await fetch(fetchUrl)
    const data = await res.json()

    if (data.error) return null

    return data.data
  }

  /**
   * @type {import('../').SearchFunction}
   */
  async single({ titles, absoluteEpisodeNumber, episode, tvdbId, tvdbEId }, options) {
    if (!titles?.length) return []

    const mediaId = await this.searchMedia(titles[0])

    if (mediaId === null) return []

    const media = await this.getMedia(mediaId)

    if (media === null) return []

    const episodeId = media.episodes.filter(item => item.tvdbId === tvdbEId)[0].id

    // const query = this.buildQuery(titles[0], episode)
    // const fetchUrl = `${this.url}/torrents/search?query=${encodeURIComponent(query)}&audio_lang=ja&fansub_lang=en&sub_lang=en`
    const fetchUrl = `${this.url}/torrents/search?media_id=${mediaId}&episode_ids=${episodeId}&audio_lang=ja&fansub_lang=en&sub_lang=en`

    const res = await fetch(fetchUrl)
    const data = await res.json()

    if (data.error) return []

    /**@type {any[]}*/
    const results = data.data.results

    return results.map(item => {
      return {
        title: item.title,
        hash: item.infohash,
        link: item.magnet,
        size: item.filesize,
        date: new Date(item.uploaded_at),
        accuracy: "high",
        seeders: item.seeders,
        leechers: item.leechers,
        downloads: item.completed,
      }
    })
  }

  batch = this.single
  movie = this.single

  async test() {
    const res = await fetch(this.url)
    return res.ok
  }
}()
