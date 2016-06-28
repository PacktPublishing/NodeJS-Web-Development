var util = require('util');

/* var notesSqlite3 = require('./models/notes-sqlite3');

notesSqlite3.connectDB().then(db => {
  return notesSqlite3.count();
})
.then(row => {
  util.log(util.inspect(row));
})
.catch(err => {
  console.error(err);
}); */

var notesSequelize = require('./models/notes-sequelize');

notesSequelize.connectDB().then(db => {
  return notesSequelize.count();
})
.then(row => {
  util.log(util.inspect(row));
})
.catch(err => {
  console.error(err);
});


