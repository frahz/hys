
/**
 * @typedef {import('../').TorrentSource} TorrentSource
 */

/**
 * @implements {TorrentSource}
 */
export default new class NekoBT {
  url = atob('aHR0cHM6Ly9uZWtvYnQudG8vYXBpL3Yx')

  getAccuracy(item) {
    if (item.mtl && item.hardsub) {
      return "low"
    }

    switch (item.level) {
      case 0:
      case 1:
      case 2:
        return "mid"
      case 3:
      case 4:
        return "high"
    }
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
  async single({ titles, tvdbId, tvdbEId }, options) {
    if (!titles?.length) return []

    const mediaId = await this.searchMedia(titles[0])

    if (mediaId === null) return []

    const media = await this.getMedia(mediaId)

    if (media === null) return []

    const episode = media.episodes.filter(item => item.tvdbId === tvdbEId)[0]

    const params = new URLSearchParams({
      media_id: mediaId,
      audio_lang: "ja",
      fansub_lang: "en",
      sub_lang: "en",
    })

    if (episode) {
      params.append("episode_ids", episode.id);
    }

    const fetchUrl = `${this.url}/torrents/search?${params}`

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
        accuracy: this.getAccuracy(item),
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
