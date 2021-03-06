$('#scrape-button').click(function() {
  $.get('/scrape')
  .then(function(data) {
    console.log('data: ', data);
    for (var i = 0; i < data.length; i++) {
      //display the information from scraped articles on page
      $("#articles").append(`<p data-id='${data[i]._id}'> ${data[i].title} <br /> ${data[i].link} </p>`);
    }
  });
});

//whenever someone clicks a p tag

$(document).on("click", "p", function() {
  //empty the notes from the note section
  $("#notes-container").empty();
  //save the id from the p tag
  var thisId = $(this).attr("data-id");

  //make an ajax call for the article
  $.ajax({
    method: "GET",
    url:"/articles/" + thisId
  })
  //Next, add the note info to the page
  .then(function(data) {
    console.log("data", data);
    var notes = $('<div id="notes">');
    //The title of the article
    notes.append(`<h2> ${data.title} </h2>`);
    //An input to enter a new title
    notes.append(`<input id="titleinput" name="title">`);
    //A textarea to add a new note body
    notes.append(`<textarea id="bodyinput" name="body"></textarea>`);
    //A button to submit a new note, with the id of the article saved to it
    notes.append(`<button class='btn' data-id=${data._id} id="savenote"> Save Note</button>`);
    $('#notes-container').append(notes);
    //If there's a note in the article
    if(data.note) {
      //Place the title of the note in the title input
      $("#titleinput").val(data.note.title);
      //Place the body of the note in the body textarea
      $("#bodyinput").val(data.note.body);
    }
  });
});

//When you click the save note button
$(document).on("click", "#savenote", function() {
  //Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log('this id... ', thisId);
  //Run a POST request to change the note, using what's entered in the input fields
  $.ajax({
    method: "POST",
    url: `/articles/${thisId}`,
    data: {
      //Value taken from title input
      title: $("#titleinput").val(),
      //Value taken from note textarea
      body: $("#bodyinput").val(),

    }
  })
  .then(function(data) {
    //log the response
    console.log("data from post request", data);
    //Empty notes section
    $("notes-container").empty();
  });
  //Also remove the values entered in the input and textarea for note entry
  $("#titleinput").val();
  $("bodyinput").val();
});
