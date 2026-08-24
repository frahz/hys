const QUALITIES = ["1080", "720", "540", "480"], SEASON_TO_MONTH = {
  WINTER: 1,
  SPRING: 4,
  SUMMER: 7,
  FALL: 10
};

function mediaStartDate(media) {
  const month = Math.max((media.startDate?.month ?? SEASON_TO_MONTH[media.season] ?? 1) - 1 - 1, 0), year = media.seasonYear ?? media.startDate?.year ?? (new Date).getFullYear();
  return new Date(year, month).toISOString();
}

export default new class AniSearch {
  url = atob("aHR0cHM6Ly9hcGkuYW5pc2VhcmNoLm9yZy90b3JyZW50cz8=");
  * _buildName(resolution, exclusions = []) {
    for (const e of exclusions) e && (yield `not.ilike.*${e}*`);
    if (resolution) for (const c of QUALITIES.filter(q => q !== resolution)) yield `not.ilike.*${c}*`;
  }
  async _fetch(fetch, search, exclusions, batch = !1) {
    for (const e of exclusions) search.append("name", e);
    const res = await fetch(this.url + search.toString());
    if (!res.ok) throw new Error(`Failed to fetch results. Status: ${res.status}`);
    const json = await res.json();
    if (!json) throw new Error("Invalid response from server!");
    return json.map(entry => ({
      title: entry.torrentName || entry.releaseName,
      link: entry.torrentFileUrl,
      seeders: 0,
      leechers: 0,
      downloads: 0,
      hash: entry.infohash,
      size: entry.length,
      accuracy: "medium",
      type: batch ? "batch" : void 0,
      date: new Date(entry.createdAt)
    }));
  }
  async single({ anidbEid: anidbEid, resolution: resolution, exclusions: exclusions, fetch: fetch, media: media }, options) {
    if (!navigator.onLine) return [];
    if (!anidbEid) throw new Error("No anidbEid provided");
    const search = new URLSearchParams({
      eid: anidbEid.toString(),
      includeFiles: "false",
      after: mediaStartDate(media)
    });
    return this._fetch(fetch, search, this._buildName(resolution, exclusions));
  }
  async batch({ anidbAid: anidbAid, resolution: resolution, exclusions: exclusions, episode: episode, media: media }, options) {
    if (!navigator.onLine) return [];
    if (!anidbAid) throw new Error("No anidbAid provided");
    const search = new URLSearchParams({
      aid: anidbAid.toString(),
      fileCount: "gte." + Math.min(24, Math.max(2, episode ?? 1)),
      includeFiles: "false",
      after: mediaStartDate(media)
    });
    return this._fetch(fetch, search, this._buildName(resolution, exclusions), !0);
  }
  async movie({ anidbAid: anidbAid, resolution: resolution, exclusions: exclusions, media: media }, options) {
    if (!navigator.onLine) return [];
    if (!anidbAid) throw new Error("No anidbAid provided");
    const search = new URLSearchParams({
      aid: anidbAid.toString(),
      includeFiles: "false",
      after: mediaStartDate(media)
    });
    return this._fetch(fetch, search, this._buildName(resolution, exclusions));
  }
  async test() {
    try {
      if (!(await fetch(this.url)).ok) throw new Error(`Failed to load data from ${this.url}! Is the site down?`);
      return !0;
    } catch (error) {
      throw new Error(`Could not reach ${this.url}! Does the site work in your region?`);
    }
  }
};
