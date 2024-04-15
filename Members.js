
class Members{

  static instances = {}

  constructor(username, connection){
    this.username = username
    this.connection = connection
    Members.instances[username] = this
  }

  static remove(username){
    delete Members.instances[username]
  }
  
  static findByUsername(username){
    return Members.instances[username]
  }

}


export default Members;
