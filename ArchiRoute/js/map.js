/**
 * map.js — Leaflet.js + OpenStreetMap 기반 지도 컨트롤러
 * API 키 불필요, file:// 직접 열기 가능
 */

const MapController = (() => {
  let map = null;
  let memberMarkers = [];
  let siteMarkers = [];
  let centroidMarker = null;

  // ── 아이콘 정의 ───────────────────────────────────────────────
  function makeMemberIcon(index) {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:#5266eb;color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:600;font-family:Inter,sans-serif;
        border:2.5px solid #fff;
        box-shadow:0 2px 8px rgba(82,102,235,0.35);
      ">${index + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  }

  const centroidIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#c3c3cc;border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

  function makeSiteIcon(highlighted, rank) {
    const bg = highlighted ? '#5266eb' : '#28253b';
    const border = highlighted ? '#fff' : '#fff';
    const size = highlighted ? 38 : 32;
    return L.divIcon({
      className: '',
      html: `<div style="
        width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${bg};border:2.5px solid ${border};
        box-shadow:${highlighted ? '0 2px 12px rgba(82,102,235,0.5)' : '0 2px 6px rgba(0,0,0,0.2)'};
        display:flex;align-items:center;justify-content:center;
      "><span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:600;font-family:Inter,sans-serif;">${rank}</span></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -(size + 4)],
    });
  }

  // ── 초기화 ────────────────────────────────────────────────────
  function init(elementId) {
    map = L.map(elementId, {
      center: [37.5665, 126.978],
      zoom: 12,
      zoomControl: true,
    });

    // OpenStreetMap 타일 (한국어 지명 포함)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    return map;
  }

  // ── 초기화 여부 ───────────────────────────────────────────────
  function isReady() {
    return map !== null;
  }

  // ── 전체 클리어 ───────────────────────────────────────────────
  function clearAll() {
    memberMarkers.forEach((m) => map.removeLayer(m));
    siteMarkers.forEach(({ marker }) => map.removeLayer(marker));
    if (centroidMarker) map.removeLayer(centroidMarker);
    memberMarkers = [];
    siteMarkers = [];
    centroidMarker = null;
  }

  // ── 팀원 마커 ─────────────────────────────────────────────────
  function placeMemberMarkers(members) {
    members.forEach((member, i) => {
      const marker = L.marker([member.lat, member.lng], {
        icon: makeMemberIcon(i),
        title: member.name,
        zIndexOffset: 200,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:120px">
            <strong style="color:#28253b">${member.name}</strong><br>
            <span style="color:#554e7b">${member.stationName}역</span>
          </div>`,
          { offset: [0, -18] }
        );
      memberMarkers.push(marker);
    });
  }

  // ── 중간점 마커 ───────────────────────────────────────────────
  function placeCentroid(centroid) {
    centroidMarker = L.marker([centroid.lat, centroid.lng], {
      icon: centroidIcon,
      title: '팀 중간 지점',
      zIndexOffset: 100,
    })
      .addTo(map)
      .bindPopup('<div style="font-family:Inter,sans-serif;font-size:13px">팀 중간 지점</div>');
  }

  // ── 답사지 마커 ───────────────────────────────────────────────
  function placeSiteMarkers(sites, onClickCallback) {
    sites.forEach((site, idx) => {
      const marker = L.marker([site.lat, site.lng], {
        icon: makeSiteIcon(false, idx + 1),
        title: site.name,
        zIndexOffset: 150,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:160px">
            <span style="font-size:11px;color:#5266eb;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">추천 ${idx + 1}</span><br>
            <strong style="color:#28253b">${site.name}</strong><br>
            <span style="color:#554e7b;font-size:12px">${site.category}</span>
          </div>`,
          { offset: [0, -(idx < 1 ? 42 : 36)] }
        );

      marker.on('click', () => {
        onClickCallback && onClickCallback(site.id);
      });

      siteMarkers.push({ marker, site, rank: idx + 1 });
    });
  }

  // ── 카드 클릭 시 핀 강조 ──────────────────────────────────────
  function highlightSite(siteId) {
    siteMarkers.forEach(({ marker, site, rank }) => {
      const isHighlighted = site.id === siteId;
      marker.setIcon(makeSiteIcon(isHighlighted, rank));
      marker.setZIndexOffset(isHighlighted ? 300 : 150);
      if (isHighlighted) {
        map.panTo([site.lat, site.lng], { animate: true, duration: 0.5 });
        marker.openPopup();
      }
    });
  }

  // ── 전체 맞춤 ─────────────────────────────────────────────────
  function fitBounds(members, sites) {
    const all = [
      ...members.map((m) => [m.lat, m.lng]),
      ...sites.map((s) => [s.lat, s.lng]),
    ];
    if (all.length) {
      map.fitBounds(L.latLngBounds(all), { padding: [48, 48] });
    }
  }

  return { init, isReady, clearAll, placeMemberMarkers, placeCentroid, placeSiteMarkers, highlightSite, fitBounds };
})();
