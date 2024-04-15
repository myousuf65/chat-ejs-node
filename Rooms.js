class Room{
  
  static instances = []

  constructor(name){
    this.name = name;
    this.members = {};
    Room.instances.push(this)
  }

  add(connection, username){
    this.members[username] = connection
  }

  remove(username){
    delete Room.members[username]
  }

};

module.exports = Room;



