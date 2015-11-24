var r = require('rethinkdb');

var pubnub = require("pubnub")({
    subscribe_key: 'demo', // always required
    publish_key: 'demo'    // only required if publishing
});

// Establish a connection
var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;

// get a book
    r.table('books').filter(r.row('name').eq("Harry Potter Series"))
      .changes()
      .run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.each(function(err, result) {
            if (err) throw err;

            pubnub.publish({  //publishing the updated seat numbers through PubNub, in 'rethinkdb-pubnub' channel
              channel: "rethinkdb-pubnub",
              message: result.new_val.availability_status, //this is the message payload we are sending
              callback: function(m){console.log(m)}
            });
            console.log(result.new_val.availability_status);
        });
    });
})


// r.table('books').insert({name: "Harry Potter Series", author: "J.K.Rowling", availability_status: "Available"})
// r.table('books').filter(r.row("name").eq("Harry Potter Series")).update({availability_status: "Booked"})
