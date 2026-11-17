/**
 * ui.js — DOM rendering helpers
 * Result cards, modal, loading/empty states, filter chips.
 */

const UI = (() => {

  /* ── Accessibility badge ───────────────────────────────────── */
  const ACCESS_BADGE = {
    free:        { label: '자유 관람',    cls: 'badge--free' },
    reservation: { label: '예약 필요',    cls: 'badge--reservation' },
    check:       { label: '운영시간 확인', cls: 'badge--check' },
    exterior:    { label: '외부 관람',    cls: 'badge--exterior' },
  };

  function accessBadgeHTML(site) {
    const b = ACCESS_BADGE[site.accessibility] || ACCESS_BADGE.check;
    return `<span class="badge ${b.cls}">${b.label}</span>`;
  }

  /* ── Verification warning ──────────────────────────────────── */
  function verificationHTML(site) {
    if (site.verified === false) {
      return `<span class="badge badge--unverified">정보 확인 필요</span>`;
    }
    return '';
  }

  /* ── Category chip ─────────────────────────────────────────── */
  function categoryChipHTML(cat) {
    return `<span class="chip chip--category">${cat}</span>`;
  }

  /* ── Distance row (per member) ─────────────────────────────── */
  function distanceRowsHTML(distances) {
    return distances
      .map(
        (d) =>
          `<div class="dist-row">
            <span class="dist-name">${d.name}</span>
            <span class="dist-km">${d.km.toFixed(1)} km</span>
          </div>`
      )
      .join('');
  }

  /* ── Result card ───────────────────────────────────────────── */
  function renderCard(site, rank, onCardClick) {
    const card = document.createElement('article');
    card.className = 'site-card';
    card.dataset.siteId = site.id;

    card.innerHTML = `
      <header class="card-header">
        <span class="card-rank">${rank}</span>
        <div class="card-meta">
          ${categoryChipHTML(site.category)}
          ${accessBadgeHTML(site)}
          ${verificationHTML(site)}
        </div>
      </header>
      <h3 class="card-title">${site.name}</h3>
      <p class="card-sub">${site.architect || '—'} · ${site.year || '—'}</p>
      <div class="card-distances">
        ${distanceRowsHTML(site._distances)}
      </div>
      <div class="card-score-row">
        <span class="score-label">최대 거리</span>
        <span class="score-val">${site._maxKm.toFixed(1)} km</span>
        <span class="score-label" style="margin-left:12px">평균 거리</span>
        <span class="score-val">${site._meanKm.toFixed(1)} km</span>
      </div>
      <button class="card-detail-btn" aria-label="${site.name} 상세 보기">상세 보기 →</button>
    `;

    // Click card → highlight map pin
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-detail-btn')) return;
      document.querySelectorAll('.site-card').forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');
      onCardClick && onCardClick(site.id);
    });

    // Click detail button → open modal
    card.querySelector('.card-detail-btn').addEventListener('click', () => {
      openModal(site);
    });

    return card;
  }

  /* ── Results list ──────────────────────────────────────────── */
  function renderResults(sites, container, onCardClick) {
    container.innerHTML = '';
    if (!sites || sites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⊘</div>
          <p class="empty-title">추천 결과가 없습니다</p>
          <p class="empty-desc">선택한 유형에 해당하는 답사지를 찾지 못했어요.<br>유형 필터를 바꿔보세요.</p>
        </div>`;
      return;
    }
    sites.forEach((site, i) => {
      container.appendChild(renderCard(site, i + 1, onCardClick));
    });
  }

  /* ── Modal ─────────────────────────────────────────────────── */
  function openModal(site) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');

    const sourceLinks = (site.source || '')
      .split(/\s+/)
      .filter((s) => s.startsWith('http'))
      .map((url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="source-link">${new URL(url).hostname}</a>`)
      .join(' · ');

    body.innerHTML = `
      <div class="modal-badges">
        ${categoryChipHTML(site.category)}
        ${accessBadgeHTML(site)}
        ${verificationHTML(site)}
      </div>
      <h2 class="modal-title">${site.name}</h2>
      <table class="modal-info-table">
        <tr><th>유형</th><td>${site.type || '—'}</td></tr>
        <tr><th>설계자</th><td>${site.architect || '—'}</td></tr>
        <tr><th>건축주</th><td>${site.client || '—'}</td></tr>
        <tr><th>준공 연도</th><td>${site.year || '—'}</td></tr>
        <tr><th>주소</th><td>${site.address || '—'}</td></tr>
      </table>
      ${site.overview ? `
        <section class="modal-section">
          <h4 class="modal-section-title">개요</h4>
          <p class="modal-section-body">${site.overview}</p>
        </section>` : ''}
      ${site.visitNote ? `
        <section class="modal-section">
          <h4 class="modal-section-title">답사 포인트 · 접근성</h4>
          <p class="modal-section-body">${site.visitNote}</p>
        </section>` : ''}
      ${sourceLinks ? `
        <section class="modal-section">
          <h4 class="modal-section-title">출처</h4>
          <p class="modal-section-body">${sourceLinks}</p>
        </section>` : ''}
    `;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus the close button for keyboard users
    setTimeout(() => document.getElementById('modal-close')?.focus(), 50);
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Loading state ─────────────────────────────────────────── */
  function showLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>답사지를 분석 중입니다…</p>
      </div>`;
  }

  /* ── Category filter chips ─────────────────────────────────── */
  function renderCategoryFilters(categories, container, onChange) {
    container.innerHTML = '';
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.setAttribute('aria-pressed', 'false');

      btn.addEventListener('click', () => {
        const isActive = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!isActive));
        btn.classList.toggle('is-active', !isActive);
        onChange(getActiveCategories(container));
      });

      container.appendChild(btn);
    });
  }

  function getActiveCategories(container) {
    return [...container.querySelectorAll('.filter-chip[aria-pressed="true"]')].map(
      (b) => b.dataset.category
    );
  }

  return {
    renderResults,
    renderCategoryFilters,
    getActiveCategories,
    openModal,
    closeModal,
    showLoading,
  };
})();
