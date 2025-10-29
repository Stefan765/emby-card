// main-card.js (Emby-only Mediarr style)

import { EmbyMoviesSection } from './emby-movies-section.js';
import { EmbySeriesSection } from './emby-series-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.collapsedSections = new Set();

    this.sections = {
      emby_movies: new EmbyMoviesSection(),
      emby_series: new EmbySeriesSection()
    };
  }

  _toggleSection(sectionKey) {
    const section = this.querySelector(`[data-section="${sectionKey}"]`);
    if (!section) return;

    const content = section.querySelector('.section-content');
    const icon = section.querySelector('.section-toggle-icon');

    if (this.collapsedSections.has(sectionKey)) {
      this.collapsedSections.delete(sectionKey);
      content.classList.remove('collapsed');
      icon.style.transform = 'rotate(0deg)';
    } else {
      this.collapsedSections.add(sectionKey);
      content.classList.add('collapsed');
      icon.style.transform = 'rotate(-90deg)';
    }
  }

  initializeCard(hass) {
    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key]);

    const orderedSections = configKeys.reduce((sections, key) => {
      let sectionKey = null;
      if (key === 'emby_movies_entity') sectionKey = 'emby_movies';
      else if (key === 'emby_series_entity') sectionKey = 'emby_series';
      if (sectionKey && !sections.includes(sectionKey)) {
        sections.push(sectionKey);
      }
      return sections;
    }, []);

    this.innerHTML = `
      <ha-card>
        <div class="card-background"></div>
        <div class="card-content">
          ${orderedSections
            .map(key => {
              const section = this.sections[key];
              return section.generateTemplate(this.config);
            })
            .join('')}
        </div>
      </ha-card>
    `;

    const style = document.createElement('style');
    style.textContent = styles;
    this.appendChild(style);

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = () => {
        const sectionKey = header.closest('[data-section]').dataset.section;
        this._toggleSection(sectionKey);
      };
    });
  }

  set hass(hass) {
    if (!this.contentInitialized) {
      this.initializeCard(hass);
      this.contentInitialized = true;
    }

    Object.entries(this.sections).forEach(([key, section]) => {
      const entityId = this.config[`${key}_entity`];
      if (entityId && hass.states[entityId]) {
        section.update(this, hass.states[entityId]);
      }
    });
  }

  setConfig(config) {
    const hasEntity = config.emby_movies_entity || config.emby_series_entity;
    if (!hasEntity) {
      throw new Error('Bitte mindestens eine Emby-Entität definieren');
    }

    this.config = {
      max_items: 10,
      ...config
    };
  }

  static getStubConfig() {
    return {
      max_items: 10,
      emby_movies_entity: 'sensor.emby_movies',
      emby_series_entity: 'sensor.emby_series'
    };
  }
}

customElements.define('mediarr-card', MediarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Emby Card",
  description: "Eine stilvolle Mediarr-Karte nur für Emby Filme & Serien",
  preview: true
});
🎬 emby-movies-section.js
js
Code kopieren
// emby-movies-section.js
export class EmbyMoviesSection {
  constructor() {
    this.sectionKey = 'emby_movies';
  }

  generateTemplate(config) {
    const label = config.emby_movies_label || 'Filme';
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
    const maxItems = card.config.emby_movies_max_items || card.config.max_items || 10;

    if (items.length === 0) {
      container.innerHTML = `<div class="empty">Keine Filme gefunden</div>`;
      return;
    }

    container.innerHTML = items
      .slice(0, maxItems)
      .map(item => `
        <div class="media-item">
          <div class="media-poster-wrapper">
            <img src="${item.thumb || item.poster || ''}" alt="${item.title}" class="media-poster">
          </div>
          <div class="media-info">
            <div class="media-title">${item.title}</div>
            <div class="media-subtitle">${item.year || ''}</div>
          </div>
        </div>
      `)
      .join('');
  }
}
📺 emby-series-section.js
js
Code kopieren
// emby-series-section.js
export class EmbySeriesSection {
  constructor() {
    this.sectionKey = 'emby_series';
  }

  generateTemplate(config) {
    const label = config.emby_series_label || 'Serien';
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
          <div class="media-poster-wrapper">
            <img src="${item.thumb || item.poster || ''}" alt="${item.title}" class="media-poster">
          </div>
          <div class="media-info">
            <div class="media-title">${item.title}</div>
            <div class="media-subtitle">
              ${item.series || ''} ${item.season ? 'S' + item.season : ''}${item.episode ? 'E' + item.episode : ''}
            </div>
          </div>
        </div>
      `)
      .join('');
  }
}
