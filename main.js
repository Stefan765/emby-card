// main.js
class EmbyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.apiData = { movies: [], series: [] };
  }

  setConfig(config) {
    if (!config.emby_url || !config.api_key || !config.user_id) {
      throw new Error('Bitte Emby URL, User-ID und API-Key angeben!');
    }

    this.config = {
      max_items: 10,
      ...config
    };
  }

  connectedCallback() {
    this.renderCard();
    this.loadData();
  }

  async loadData() {
    const { emby_url, api_key, user_id, max_items } = this.config;

    try {
      // Filme
      const moviesResponse = await fetch(`${emby_url}/Users/${user_id}/Items?IncludeItemTypes=Movie&SortBy=DateCreated&SortOrder=Descending&Limit=${max_items}&api_key=${api_key}`);
      if (!moviesResponse.ok) throw new Error('Keine gültigen Daten für Filme erhalten');
      const moviesData = await moviesResponse.json();
      this.apiData.movies = moviesData.Items || [];

      // Serien
      const seriesResponse = await fetch(`${emby_url}/Users/${user_id}/Items?IncludeItemTypes=Series&SortBy=DateCreated&SortOrder=Descending&Limit=${max_items}&api_key=${api_key}`);
      if (!seriesResponse.ok) throw new Error('Keine gültigen Daten für Serien erhalten');
      const seriesData = await seriesResponse.json();
      this.apiData.series = seriesData.Items || [];

      this.renderCard();
    } catch (error) {
      this.shadowRoot.innerHTML = `<ha-card>
        <div style="padding: 16px; color: red;">⚠️ Fehler beim Laden der Emby-Daten: ${error.message}</div>
      </ha-card>`;
      console.error('EmbyCard Error:', error);
    }
  }

  renderCard() {
    const moviesHTML = this.apiData.movies.map(item => `
      <div class="item">
        <img src="${this.getImageUrl(item)}" alt="${item.Name}" />
        <div class="title">${item.Name}</div>
      </div>
    `).join('');

    const seriesHTML = this.apiData.series.map(item => `
      <div class="item">
        <img src="${this.getImageUrl(item)}" alt="${item.Name}" />
        <div class="title">${item.Name}</div>
      </div>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; }
        .section { margin-bottom: 24px; }
        .section-title { font-weight: bold; margin-bottom: 8px; }
        .row { display: flex; overflow-x: auto; gap: 12px; }
        .item { width: 120px; flex-shrink: 0; text-align: center; }
        .item img { width: 100%; border-radius: 8px; }
        .title { margin-top: 4px; font-size: 0.85em; }
      </style>
      <ha-card>
        <div class="section">
          <div class="section-title">Filme</div>
          <div class="row">${moviesHTML}</div>
        </div>
        <div class="section">
          <div class="section-title">Serien</div>
          <div class="row">${seriesHTML}</div>
        </div>
      </ha-card>
    `;
  }

  getImageUrl(item) {
    if (!item || !item.ImageTags || !item.ImageTags.Primary) return '';
    return `${this.config.emby_url}/Items/${item.Id}/Images/Primary?api_key=${this.config.api_key}`;
  }
}

customElements.define('emby-card', EmbyCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'emby-card',
  name: 'Emby Card',
  description: 'Zeigt die neuesten Filme und Serien von Emby an',
  preview: true
});
