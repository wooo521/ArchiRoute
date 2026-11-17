/**
 * app.js — Main application entry point
 * Coordinates data loading, member input, filters, recommendation, and map.
 */

// ── State ────────────────────────────────────────────────────────
let allSites = [];
let members = [];          // [{name, stationName, lat, lng}]
let selectedCategories = [];
let mapReady = false;      // true after MapController.init() succeeds
const TOP_N = 5;

// ── DOM refs ─────────────────────────────────────────────────────
const memberListEl = document.getElementById('member-list');
const addMemberBtn = document.getElementById('add-member-btn');
const filterContainer = document.getElementById('category-filters');
const resultsContainer = document.getElementById('results-container');
const resultsSection = document.getElementById('results-section');
const memberCount = document.getElementById('member-count');
const searchBtn = document.getElementById('search-btn');
const topNSelect = document.getElementById('top-n-select');

// ── Load data ─────────────────────────────────────────────────────
async function loadSites() {
  if (typeof SITES_DATA === 'undefined') {
    throw new Error('sites.js 로드 실패 — data/sites.js 파일을 확인하세요.');
  }
  allSites = SITES_DATA;
}

// ── Categories ────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  '미술관·박물관',
  '궁궐·전통건축',
  '종교건축',
  '업무·문화복합시설',
  '교육·도서관',
  '주거·소규모건축',
  '공원·공연·공공시설',
  '기타',
];

// ── Member input ──────────────────────────────────────────────────
let memberIdCounter = 0;

function createMemberRow() {
  const id = ++memberIdCounter;
  const row = document.createElement('div');
  row.className = 'member-row';
  row.dataset.memberId = id;

  row.innerHTML = `
    <div class="member-row__fields">
      <div class="member-name-wrap">
        <input
          type="text"
          class="input member-name"
          placeholder="이름 (예: 김민준)"
          maxlength="20"
          aria-label="팀원 이름"
        />
      </div>
      <div class="member-station-wrap autocomplete-wrap">
        <input
          type="text"
          class="input member-station"
          placeholder="지하철역 (예: 홍대입구)"
          maxlength="30"
          autocomplete="off"
          aria-label="출발 지하철역"
          aria-autocomplete="list"
        />
        <ul class="autocomplete-list" role="listbox" aria-label="지하철역 추천" hidden></ul>
      </div>
    </div>
    <button class="remove-btn" aria-label="팀원 삭제" title="삭제">✕</button>
  `;

  // Autocomplete wiring
  const stationInput = row.querySelector('.member-station');
  const acList = row.querySelector('.autocomplete-list');

  stationInput.addEventListener('input', () => {
    const q = stationInput.value.trim();
    const suggestions = subwayAutocomplete(q, 8);
    renderAutocomplete(acList, suggestions, (station) => {
      stationInput.value = station.name;
      stationInput.dataset.lat = station.lat;
      stationInput.dataset.lng = station.lng;
      hideAutocomplete(acList);
      updateMemberState();
    });
  });

  stationInput.addEventListener('keydown', (e) => {
    handleAutocompleteKeydown(e, acList, stationInput, updateMemberState);
  });

  stationInput.addEventListener('blur', () => {
    setTimeout(() => hideAutocomplete(acList), 150);
  });

  stationInput.addEventListener('focus', () => {
    if (stationInput.value.trim()) {
      const suggestions = subwayAutocomplete(stationInput.value.trim(), 8);
      renderAutocomplete(acList, suggestions, (station) => {
        stationInput.value = station.name;
        stationInput.dataset.lat = station.lat;
        stationInput.dataset.lng = station.lng;
        hideAutocomplete(acList);
        updateMemberState();
      });
    }
  });

  // Enter key → move to next input or trigger search
  stationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && acList.hidden) {
      e.preventDefault();
      const rows = [...memberListEl.querySelectorAll('.member-row')];
      const thisIdx = rows.indexOf(row);
      const nextRow = rows[thisIdx + 1];
      if (nextRow) {
        nextRow.querySelector('.member-name').focus();
      } else {
        // If valid + < 6 members, add new row
        if (members.length < 6 && members.length >= 1) {
          addMemberRow();
        } else {
          searchBtn.focus();
        }
      }
    }
  });

  const nameInput = row.querySelector('.member-name');
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stationInput.focus();
    }
  });
  nameInput.addEventListener('input', updateMemberState);

  // Remove button
  row.querySelector('.remove-btn').addEventListener('click', () => {
    row.remove();
    updateMemberState();
  });

  memberListEl.appendChild(row);
  row.querySelector('.member-name').focus();
  updateMemberState();
  return row;
}

function addMemberRow() {
  const currentCount = memberListEl.querySelectorAll('.member-row').length;
  if (currentCount >= 6) {
    showToast('팀원은 최대 6명까지 추가할 수 있어요.');
    return;
  }
  createMemberRow();
}

function updateMemberState() {
  const rows = [...memberListEl.querySelectorAll('.member-row')];
  const count = rows.length;

  // Collect valid members
  members = [];
  rows.forEach((row) => {
    const name = row.querySelector('.member-name').value.trim();
    const stationInput = row.querySelector('.member-station');
    const lat = parseFloat(stationInput.dataset.lat);
    const lng = parseFloat(stationInput.dataset.lng);
    const stationName = stationInput.value.trim();
    if (name && stationName && !isNaN(lat) && !isNaN(lng)) {
      members.push({ name, stationName, lat, lng });
    }
  });

  // Update count badge
  memberCount.textContent = `${count}명`;

  // Show/hide remove buttons (min 2 members)
  rows.forEach((row) => {
    row.querySelector('.remove-btn').style.display = count <= 2 ? 'none' : '';
  });

  // Add button disabled when at max
  addMemberBtn.disabled = count >= 6;
  addMemberBtn.textContent = count >= 6 ? '최대 6명' : '+ 팀원 추가';

  // Search button state
  const isReady = members.length >= 2;
  searchBtn.disabled = !isReady;
  searchBtn.classList.toggle('is-ready', isReady);
}

// ── Autocomplete helpers ──────────────────────────────────────────
function renderAutocomplete(listEl, suggestions, onSelect) {
  listEl.innerHTML = '';
  if (!suggestions.length) {
    listEl.hidden = true;
    return;
  }
  suggestions.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'autocomplete-item';
    li.setAttribute('role', 'option');
    li.setAttribute('id', `ac-item-${i}`);
    li.textContent = s.name;
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onSelect(s);
    });
    listEl.appendChild(li);
  });
  listEl.hidden = false;
}

function hideAutocomplete(listEl) {
  listEl.hidden = true;
  listEl.innerHTML = '';
}

function handleAutocompleteKeydown(e, listEl, input, onChange) {
  const items = [...listEl.querySelectorAll('.autocomplete-item')];
  const active = listEl.querySelector('.autocomplete-item.is-active');
  let idx = items.indexOf(active);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (listEl.hidden) return;
    idx = Math.min(idx + 1, items.length - 1);
    items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx = Math.max(idx - 1, 0);
    items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
  } else if (e.key === 'Enter' && active && !listEl.hidden) {
    e.preventDefault();
    input.value = active.textContent;
    // Find station data
    const station = subwayAutocomplete(active.textContent, 1)[0];
    if (station) {
      input.dataset.lat = station.lat;
      input.dataset.lng = station.lng;
    }
    hideAutocomplete(listEl);
    onChange && onChange();
  } else if (e.key === 'Escape') {
    hideAutocomplete(listEl);
  }
}

// ── Search & recommend ────────────────────────────────────────────
function runSearch() {
  if (members.length < 2) {
    showToast('출발지를 2개 이상 입력해야 추천할 수 있어요.');
    return;
  }

  UI.showLoading(resultsContainer);
  resultsSection.classList.remove('is-hidden');

  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  const topN = parseInt(topNSelect?.value || '5', 10);
  const results = recommendSites(members, allSites, {
    categories: selectedCategories,
    topN,
  });

  const centroid = computeCentroid(members);

  // Update map (only if Maps API loaded)
  if (mapReady) {
    MapController.clearAll();
    MapController.placeMemberMarkers(members);
    MapController.placeCentroid(centroid);
    MapController.placeSiteMarkers(results, (siteId) => {
      // Highlight the corresponding card
      document.querySelectorAll('.site-card').forEach((c) => c.classList.remove('is-active'));
      const card = document.querySelector(`.site-card[data-site-id="${siteId}"]`);
      if (card) {
        card.classList.add('is-active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    MapController.fitBounds(members, results);
  }


  // Render cards
  UI.renderResults(results, resultsContainer, (siteId) => {
    MapController.highlightSite(siteId);
  });
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  try {
    await loadSites();
  } catch (err) {
    resultsContainer.innerHTML = `<div class="empty-state"><p class="empty-title">데이터를 불러오지 못했습니다</p><p class="empty-desc">${err.message}</p></div>`;
    return;
  }

  // Render category filters
  UI.renderCategoryFilters(ALL_CATEGORIES, filterContainer, (active) => {
    selectedCategories = active;
    // Auto-search if already has results visible
    if (!resultsSection.classList.contains('is-hidden') && members.length >= 2) {
      runSearch();
    }
  });

  // Initial member rows (2 required)
  createMemberRow();
  createMemberRow();

  // Buttons
  addMemberBtn.addEventListener('click', addMemberRow);
  searchBtn.addEventListener('click', runSearch);

  // Top-N selector
  topNSelect?.addEventListener('change', () => {
    if (!resultsSection.classList.contains('is-hidden') && members.length >= 2) {
      runSearch();
    }
  });

  // Modal close — also sync aria-hidden
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay' || e.target.id === 'modal-close') {
      UI.closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') UI.closeModal();
  });

  // Map
  try {
    MapController.init('map');
    mapReady = true;
  } catch (e) {
    console.warn('[ArchiRoute] 지도 초기화 실패:', e.message);
    document.getElementById('map').innerHTML =
      `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--slate);font-size:14px;flex-direction:column;gap:8px">
        <span style="font-size:28px">🗺</span>
        <span>config.js에 Google Maps API 키를 설정하면 지도가 표시됩니다.</span>
      </div>`;
  }
}

// ── Google Maps callback ──────────────────────────────────────────
function initMap() {
  // Called by Maps JS API after load
  init();
}
