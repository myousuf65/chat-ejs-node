class Room {
  static instances = new Map();

  constructor(name, creator) {
    this.name = name;
    this.members = new Map();
    this.creator = creator;
    Room.instances.set(name, this);
  }

  add(connection, username) {
    this.members.set(username, connection);
  }

  remove(username) {
    this.members.delete(username);
    if (this.members.size === 0) {
      Room.instances.delete(this.name);
    }
  }

  broadcast(message, sender) {
    const payload = {
      type: 'GROUP_MESSAGE',
      room: this.name,
      from: sender,
      content: message,
      timestamp: new Date()
    };

    this.members.forEach((connection, username) => {
      if (username !== sender) { // Don't send back to sender
        connection.send(JSON.stringify(payload));
      }
    });
  }

  getMembers() {
    return Array.from(this.members.keys());
  }

  static getRoom(name) {
    return Room.instances.get(name);
  }

  static createRoom(name, creator) {
    if (Room.instances.has(name)) {
      return null; // Room already exists
    }
    return new Room(name, creator);
  }

  static listRooms() {
    return Array.from(Room.instances.keys());
  }
}

export default Room;



