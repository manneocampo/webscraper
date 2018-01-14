var mongoose = require("mongoose");

//save a reference to the Schema constructor
var Schema = mongoose.Schema;

//Using the Schema constructor, create a new Note Schema Object
var NoteSchema = new Schema({
  title:String,
  body: String
});

//mongoose model method to create model from the above schema
var Note = mongoose.model("Note", NoteSchema);

//Export the Note model
module.exports = Note;
