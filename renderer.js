const { ipcRenderer } = require('electron');
window.api = ipcRenderer;

document.addEventListener('DOMContentLoaded', () => {
  // Ajouter un gestionnaire d'événements "click" pour les boutons "Stopper"
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('stop-session-btn')) {
      const id = event.target.dataset.id;
      stopSession(id);
    }
  });
});


