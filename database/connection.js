const { MongoClient } = require("mongodb");

//const DatabaseURI = process.env.ATLAS_URI;
const DatabaseURI = process.env.ATLAS_URI;
const DatabaseName = process.env.DATABASE_NAME;

const client = new MongoClient(DatabaseURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 

var database;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      // Verify we got a good "db" object
      if (db)
      {
        database = db.db(DatabaseName);
        console.log("Successfully connected to MongoDB!!!"); 
      }
      return callback(err);
         });
  },
 
  getDb: function () {
    return database;
  },
};