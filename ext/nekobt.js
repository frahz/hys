
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

  /**
   * @type {import('../').SearchFunction}
   */
  async single({ titles, episode }, options) {
    if (!titles?.length) return []

    const query = this.buildQuery(titles[0], episode)
    const fetchUrl = `${this.url}/torrents/search?query=${encodeURIComponent(query)}&audio_lang=ja&fansub_lang=en&sub_lang=en`

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
