const { EventEmitter } = require('events');

class SessionController extends EventEmitter {
  constructor(model, view) {
    super()
    this.model = model;
    this.view = view;
    this.view.on('stopSession', (id) => this.stopSession(id));
  }

  async loadSessions() {
    await this.model.fetchSessions();
    this.view.displaySessions(this.model.getSessions());
  }

  filterSessionsByToday() {
    const today = new Date();
    const todaySessions = this.model.getSessions().filter((session) => {
      const sessionDate = new Date(session.dateTime);
      return (
        sessionDate.getFullYear() === today.getFullYear() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getDate() === today.getDate()
      );
    });
    this.view.displaySessions(todaySessions);
  }

  async stopSession(id) {
    const session = this.model.getSessionById(id);
    if (!session) return;

    session.status = 'stopped';
    const response = await fetch(`http://127.0.0.1:1337/api/sessions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'Annulé'
      })
    });

    if (response.ok) {
      await this.loadSessions();
    } else {
      console.error(`Failed to stop session with ID ${id}`);
    }
  }
}

module.exports = SessionController;
