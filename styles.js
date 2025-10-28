// styles.js
export const styles = `
  /* Gesamt-Container für Karten */
  .card-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
  }

  /* Einzelnes Jellyfin-Media-Item */
  .jellyfin-item {
    width: 120px;
    height: 180px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
    opacity: 0;
    animation: fadeIn 0.5s forwards;
  }

  /* Hover-Effekt für Desktop */
  .jellyfin-item:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 15px rgba(0,0,0,0.3);
    z-index: 10;
  }

  /* Verhindert Cover-Skalierung, wenn Popup aktiv */
  .jellyfin-item.popup-active {
    transform: none !important;
    z-index: auto;
  }

  /* Fade-In Animation beim Laden */
  @keyframes fadeIn {
    to { opacity: 1; }
  }

  /* Overlay-Titel auf Hover */
  .jellyfin-item::after {
    content: attr(data-title);
    position: absolute;
    bottom: 5px;
    left: 5px;
    right: 5px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    font-size: 0.8em;
    padding: 2px 4px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .jellyfin-item:hover::after {
    opacity: 1;
  }

  /* Modal für Langbeschreibung */
  .description-modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.7);
  }

  .description-modal.show {
    display: block;
  }

  .description-modal-content {
    background-color: #fff;
    margin: 10% auto;
    padding: 20px;
    width: 80%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    position: relative;
  }

  .description-modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
    cursor: pointer;
  }

  /* Text innerhalb des Modals */
  #descriptionTitle {
    margin-top: 0;
    font-size: 1.2em;
    font-weight: bold;
  }

  #descriptionText {
    font-size: 1em;
    margin-top: 10px;
    line-height: 1.4;
  }
`;
