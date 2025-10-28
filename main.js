// main-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.6.1/index.js?module';
import { styles } from './styles.js';

class EmbyCard extends LitElement {
  static properties = {
    embyUrl: { type: String },
    apiKey: { type: String },
    movies: { type: Array },
    series: { type: Array },
    clients: { type: Array },
    selectedMedia: { type: Object },
    showClientModal: { type: Boolean }
  };

  static styles = styles;

  constructor() {
    super();
    this.movies = [];
    this.series = [];
    this.clients = [];
    this.selectedMedia = null;
    this.showClientModal = false;
  }

  firstUpdated() {
    this.fetchMedia();
    this.fetchClients();
  }

  // Medien abrufen (Filme + Serien)
  async fetchMedia() {
    if (!this.embyUrl || !this.apiKey) return;

    try {
      const moviesResp = await fetch(`${this.embyUrl}/emby/Items?IncludeItemTypes=Movie&Limit=10`, {
        headers: { 'X-Emby-Token': this.apiKey }
      });
      const moviesData = await moviesResp.json();
      this.movies = moviesData.Items || [];

      const seriesResp = await fetch(`${this.embyUrl}/emby/Items?IncludeItemTypes=Series&Limit=10`, {
        headers: { 'X-Emby-Token': this.apiKey }
      });
      const seriesData = await seriesResp.json();
      this.series = seriesData.Items || [];
    } catch (err) {
      console.error('Fehler beim Abrufen der Medien:', err);
    }
  }

  // Verfügbare Clients abrufen
  async fetchClients() {
    if (!this.embyUrl || !this.apiKey) return;

    try {
      const resp = await fetch(`${this.embyUrl}/emby/Sessions`, {
        headers: { 'X-Emby-Token': this.apiKey }
      });
      const data = await resp.json();
      this.clients = (data.Items || []).map(item => ({
        id: item.Player?.Id,
        name: item.UserName || item.Player?.Name
      }));
    } catch (err) {
      console.error('Fehler beim Abrufen der Clients:', err);
    }
  }

  // Play-Button klicken
  async playMedia(media) {
    this.sele