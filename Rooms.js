export default class Room {
  static rooms = new Map();

  static createRoom(name, creator) {
    if (this.rooms.has(name)) {
      return null;
    }
    
    this.rooms.set(name, {
      name,
      creator,
      clients: new Set()
    });
    
    return this.rooms.get(name);
  }

  static getRoom(name) {
    return this.rooms.get(name);
  }

  static joinRoom(name, client) {
    const room = this.rooms.get(name);
    if (room) {
      room.clients.add(client);
      return true;
    }
    return false;
  }

  static leaveRoom(name, client) {
    const room = this.rooms.get(name);
    if (room) {
      room.clients.delete(client);
      if (room.clients.size === 0) {
        this.rooms.delete(name);
      }
      return true;
    }
    return false;
  }

  static broadcast(name, message, sender) {
    const room = this.rooms.get(name);
    if (room) {
      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'GROUP_MESSAGE',
            room: name,
            from: sender,
            content: message,
            timestamp: new Date()
          }));
        }
      });
    }
  }
}