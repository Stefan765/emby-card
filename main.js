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
    this.renderLoading();
    this.loadData();
  }

  renderLoading() {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div style="padding:16px;">Lade Emby-Daten...</div>
      </ha-card>
    `;
  }

  async loadData() {
    const { emby_url, api_key, user_id, max_items } = this.config;

    try {
      // Filme laden
      const moviesResponse = await fetch(`${emby_url}/Users/${user_id}/Items/Latest?IncludeItemTypes=Movie&Limit=${max_items}&api_key=${api_key}`);
      if (!moviesResponse.ok) throw new Error('Keine gültigen Daten für Filme erhalten');
      const moviesData = await moviesResponse.json();
      this.apiData.movies = moviesData.Items || [];

      // Serien laden
      const seriesResponse = await fetch(`${emby_url}/Users/${user_id}/Items/Latest?IncludeItemTypes=Series&Limit=${max_items}&api_key=${api_key}`);
      if (!seriesResponse.ok) throw new Error('Keine gültigen Daten für Serien erhalten');
      const seriesData = await seriesResponse.json();
      this.apiData.series = seriesData.Items || [];

      this.renderCard();
    } catch (error) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding:16px; color:red;">⚠️ Fehler beim Laden der Emby-Daten: ${error.message}</div>
        </ha-card>
      `;
      console.error('EmbyCard Error:', error);
    }
  }

  renderCard() {
    const moviesHTML = this.apiData.movies.map(item => this.renderItem(item)).join('');
    const seriesHTML = this.apiData.series.map(item => this.renderItem(item)).join('');

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; }
        .section { margin-bottom: 24px; }
        .section-title { font-weight: bold; margin-bottom: 8px; font-size:1.1em; }
        .row { display: flex; overflow-x: auto; gap: 12px; }
        .item { width: 120px; flex-shrink: 0; text-align: center; }
        .item img { width: 100%; border-radius: 8px; }
        .title { margin-top: 4px; font-size: 0.85em; word-break: break-word; }
      </style>
      <ha-card>
        <div class="section">
          <div class="section-title">Filme</div>
          <div class="row">${moviesHTML || '<div>Keine Filme gefunden</div>'}</div>
        </div>
        <div class="section">
          <div class="section-title">Serien</div>
          <div class="row">${seriesHTML || '<div>Keine Serien gefunden</div>'}</div>
        </div>
      </ha-card>
    `;
  }

  renderItem(item) {
    const imageUrl = this.getImageUrl(item);
    const name = item?.Name || 'Unbekannt';
    return `
      <div class="item">
        <img src="${imageUrl}" alt="${name}" />
        <div class="title">${name}</div>
      </div>
    `;
  }

  getImageUrl(item) {
    if (!item?.ImageTags) return 'https://via.placeholder.com/120x180?text=Kein+Bild';
    const tag = item.ImageTags.Primary || Object.values(item.ImageTags)[0];
    if (!tag) return 'https://via.placeholder.com/120x180?text=Kein+Bild';
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
