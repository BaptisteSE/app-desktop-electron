class SessionModel {
    constructor() {
      this.sessions = [];
    }
  
    async fetchSessions() {
      const response = await fetch('http://127.0.0.1:1337/api/sessions?populate=*');
      const json = await response.json();
      this.sessions = json.data.map(session => {
        return {
          id: session.id,
          dateTime: session.attributes.dateTime,
          createdAt: session.attributes.createdAt,
          updatedAt: session.attributes.updatedAt,
          publishedAt: session.attributes.publishedAt,
          scenario: session.attributes.scenario.data.attributes,
          room: session.attributes.room.data.attributes,
          status: session.attributes.status,
        };
      });
    }
  
    getSessions() {
      return this.sessions;
    }
  
    getSessionById(id) {
      return this.sessions.find(session => session.id === id);
    }
  
    async stopSession(id) {
        const session = this.model.getSessionById(id);
        if (!session) return;
      
        const result = await fetch(`http://127.0.0.1:1337/api/sessions/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      
        if (result.ok) {
          const index = this.model.getSessions().findIndex(session => session.id === id);
          if (index >= 0) {
            this.model.getSessions().splice(index, 1);
            this.view.displaySessions(this.model.getSessions());
          }
        } else {
          console.error(`Failed to stop session with ID ${id}`);
        }
      }
      
  }
  
  module.exports = SessionModel;
  