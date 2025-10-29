// emby-series-section.js

export class EmbySeriesSection {
  constructor() {
    this.sectionKey = 'emby_series';
  }

  generateTemplate(config) {
    const label = config.emby_series_label || 'Emby Serien';
    return `
      <div class="section" data-section="${this.sectionKey}">
        <div class="section-header">
          <div class="section-title">${label}</div>
          <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content"></div>
      </div>
    `;
  }

  update(card, entity) {
    const container = card.querySelector(`[data-section="${this.sectionKey}"] .section-content`);
    if (!container) return;

    const items = entity.attributes.data || [];
    const maxItems = card.config.emby_series_max_items || card.config.max_items || 10;

    if (items.length === 0) {
      container.innerHTML = `<div class="empty">Keine Serien gefunden</div>`;
      return;
    }

    container.innerHTML = items
      .slice(0, maxItems)
      .map(item => `
        <div class="media-item">
          <img src="${item.thumb || item.poster || ''}" alt="${item.title}" class="media-poster">
          <div class="media-title">${item.title}</div>
          <div class="media-subtitle">${item.season || ''} ${item.episode || ''}</div>
        </div>
      `)
      .join('');
  }
}
