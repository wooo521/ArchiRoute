/**
 * recommend.js — Pure recommendation engine
 * No DOM dependencies. Fully testable in isolation.
 */

/**
 * Haversine formula: returns distance in km between two lat/lng points.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Compute the centroid (average lat/lng) of a list of members.
 * @param {Array<{lat: number, lng: number}>} members
 * @returns {{lat: number, lng: number}}
 */
function computeCentroid(members) {
  const lat = members.reduce((s, m) => s + m.lat, 0) / members.length;
  const lng = members.reduce((s, m) => s + m.lng, 0) / members.length;
  return { lat, lng };
}

/**
 * Recommend field-trip sites.
 *
 * Scoring (lower = better):
 *   primary key: max distance among all members  (minimax — fairest)
 *   secondary key: mean distance (tiebreaker)
 *
 * @param {Array<{name:string, lat:number, lng:number}>} members  — team members
 * @param {Array<Object>} sites                                   — full site list
 * @param {Object} options
 * @param {string[]} [options.categories]  — filter by category (empty = all)
 * @param {number}  [options.topN=5]       — number of results
 * @returns {Array<Object>} scored & sorted sites (top N)
 */
function recommendSites(members, sites, options = {}) {
  const { categories = [], topN = 5 } = options;

  if (!members || members.length < 2) return [];

  // 1. Filter by selected categories (if any)
  let candidates = sites.filter((s) => s.lat != null && s.lng != null);
  if (categories.length > 0) {
    candidates = candidates.filter((s) => categories.includes(s.category));
  }

  if (candidates.length === 0) return [];

  // 2. Score each candidate
  const scored = candidates.map((site) => {
    const distances = members.map((m) => ({
      name: m.name,
      km: haversineKm(m.lat, m.lng, site.lat, site.lng),
    }));
    const kms = distances.map((d) => d.km);
    const maxKm = Math.max(...kms);
    const meanKm = kms.reduce((s, v) => s + v, 0) / kms.length;

    return {
      ...site,
      _distances: distances,  // per-member breakdown
      _maxKm: maxKm,
      _meanKm: meanKm,
    };
  });

  // 3. Sort: primary = maxKm asc, secondary = meanKm asc
  scored.sort((a, b) => {
    if (Math.abs(a._maxKm - b._maxKm) > 0.01) return a._maxKm - b._maxKm;
    return a._meanKm - b._meanKm;
  });

  return scored.slice(0, topN);
}
