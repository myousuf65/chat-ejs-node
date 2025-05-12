db = db.getSiblingDB('chat-app');

// Create users collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        password: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        friends: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          }
        }
      }
    }
  }
});

// Create messages collection
db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["to", "from", "content"],
      properties: {
        to: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        from: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        content: {
          bsonType: "string",
          description: "must be a string and is required"
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.messages.createIndex({ "createdAt": 1 }); 