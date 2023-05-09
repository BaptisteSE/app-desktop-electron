const { dialog } = require('electron');
const { EventEmitter } = require('events');

class SessionView extends EventEmitter {
  constructor(webContents) {
    super();
    this.webContents = webContents;
    this.isDomReady = false;
    this.sessionList = [];

    this.webContents.on('did-finish-load', () => {
      this.isDomReady = true;
      this.displaySessions(this.sessionList);
    });
  }

  displaySessions(sessions) {
    // Supprimer les anciens gestionnaires d'événements
    this.webContents.executeJavaScript(`
      document.querySelectorAll('.stop-session-btn').forEach((button) => {
        button.removeEventListener('click', stopSession);
      });
    `);
  
    // Ajouter les nouveaux éléments de la liste des sessions
    const sessionList = sessions.map((session) => {
      return `
        <li>
          Session ${session.id}
          - Date et heure : ${session.dateTime}
          - Salle : ${session.room.name}
          - Scénario : ${session.scenario.title}
          - Statut : ${session.status}
          <button class="stop-session-btn" data-id="${session.id}">Stopper</button>
        </li>
      `;
    }).join('');
  
    this.webContents.executeJavaScript(`
    sessionsList = document.getElementById('sessions-list');
    sessionsList.innerHTML = ${JSON.stringify(sessionList)};
    document.querySelectorAll('.stop-session-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const confirmation = confirm('Êtes-vous sûr de vouloir supprimer cette session ?');
        if (confirmation) {
          window.api.send('stopSession', id);
          button.parentNode.remove();
        }
      });
    });
  `);
  
    // Définir le gestionnaire d'événements stopSession()
    const stopSession = (event) => {
      const id = event.target.dataset.id;
      const confirmation = confirm('Êtes-vous sûr de vouloir arrêter cette session ?');
      if (confirmation) {
        window.api.send('stopSession', id);
      }
    };
  }
  
}

module.exports = SessionView;
