var r = require('rethinkdb'); // Initialise rethinkdb instance

var pubnub = require("pubnub")({ // Initialise pubnub instance
    subscribe_key: 'demo', // always required
    publish_key: 'demo'    // only required if publishing
});

// Establish a connection
var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;

// Get a book
    r.table('books').filter(r.row('name').eq("Harry Potter Series")) // Get a  book with name 'Harry Potter'
      .changes() // Look for any changes happening to this record and keeps returning it
      .run(connection, function(err, cursor) { // run the above query on this connection
        if (err) throw err;
        cursor.each(function(err, result) { // If there is no error, it returns a cursor, which is collection of JSON objects
            if (err) throw err;

            pubnub.publish({  //publishing the updated Book's status through PubNub, in 'rethinkdb-pubnub' channel
              channel: "rethinkdb-pubnub",
              message: {"status" : result.new_val.availability_status}, //this is the message payload we are sending
              // result contains a new value and the old value of this record. This is due to .changes() method.
              callback: function(m){console.log(m)}
            });
            console.log({"status" : result.new_val.availability_status});
        });
    });
})


// r.table('books').insert({name: "Harry Potter Series", author: "J.K.Rowling", availability_status: "Available"})
// r.table('books').filter(r.row("name").eq("Harry Potter Series")).update({availability_status: "Booked"})
