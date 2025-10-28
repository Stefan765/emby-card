// main-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.6.1/index.js?module';
import { styles } from './styles.js';

class EmbyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.movies = [];
    this.series = [];
  }

  setConfig(config) {
    if (!config.emby_url || !config.api_key) {
      throw new Error("Bitte 'emby_url' und 'api_key' in der Konfiguration angeben.");
    }

    this.config = {
      max_movies: config.max_movies || 10,
      max_series: config.max_series || 10,
      ...config
    };

    this._fetchData();
  }

async _fetchData() {
  const { emby_url, api_key, max_movies, max_series } = this.config;

  const fetchJSON = async (type, limit) => {
    const url = `${emby_url}/Items/Latest?IncludeItemTypes=${type}&Limit=${limit}&api_key=${api_key}`;
    const res = await fetch(url);
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("❌ Emby gab keine JSON-Antwort:", text.slice(0, 200));
      throw new Error("Ungültige Antwort von Emby erhalten.");
    }
  };

  try {
    const movies = await fetchJSON("Movie", max_movies);
    const series = await fetchJSON("Series", max_series);

    if ((!movies || !movies.length) && (!series || !series.length)) {
      throw new Error("Keine gültigen Daten von Emby erhalten.");
    }

    this.movies = movies;
    this.series = series;
    this._render();
  } catch (err) {
    console.error("Fehler beim Laden der Emby-Daten:", err);
    this._renderError(err);
  }
}



  _render() {
    if (!this.shadowRoot) return;

    const card = document.createElement("ha-card");
    card.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          background: rgba(0, 0, 0, 0.4);
          color: white;
          padding: 8px;
        }
        .section-title {
          font-size: 1.1em;
          font-weight: bold;
          margin: 6px 0;
        }
        .media-row {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 8px;
        }
        .media-item {
          flex: 0 0 auto;
          width: 100px;
          position: relative;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
        }
        .media-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s;
        }
        .media-item:hover img {
          transform: scale(1.05);
        }
        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 6px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
        }
        .title {
          font-size: 0.9em;
          font-weight: bold;
          color: white;
          text-shadow: 0 1px 2px black;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .description {
          font-size: 0.8em;
          opacity: 0.8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      </style>

      <div class="section">
        <div class="section-title">🎬 Filme</div>
        <div class="media-row">
          ${this.movies.map(movie => `
            <div class="media-item" title="${movie.Name}">
              <img src="${this._getImageUrl(movie)}" alt="${movie.Name}" />
              <div class="overlay">
                <div class="title">${movie.Name}</div>
                <div class="description">${movie.Overview ? movie.Overview : ''}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">📺 Serien</div>
        <div class="media-row">
          ${this.series.map(show => `
            <div class="media-item" title="${show.Name}">
              <img src="${this._getImageUrl(show)}" alt="${show.Name}" />
              <div class="overlay">
                <div class="title">${show.Name}</div>
                <div class="description">${show.Overview ? show.Overview : ''}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(card);
  }

  _renderError(err) {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div style="color:red; padding: 16px;">
          ⚠️ Fehler beim Laden der Emby-Daten: ${err.message}
        </div>
      </ha-card>
    `;
  }

  _getImageUrl(item) {
    const { emby_url, api_key } = this.config;
    return `${emby_url}/emby/Items/${item.Id}/Images/Primary?maxHeight=300&quality=90&api_key=${api_key}`;
  }

  set hass(hass) {
    // nicht benötigt, aber Pflicht für HA-Kompatibilität
  }

  getCardSize() {
    return 3;
  }
}

// 🔹 Registrierung für Home Assistant
customElements.define('emby-card', EmbyCard);

// 🔹 Info für HACS
window.customCards = window.customCards || [];
window.customCards.push({
  type: "emby-card",
  name: "Emby Card",
  description: "Zeigt Filme und Serien aus Emby in zwei Reihen an."
});


