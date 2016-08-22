/////////////////////////////////////////////////////////////////////////////
// $Id$
// Copyright (C) 2016  Matthias Lübben
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
/////////////////////////////////////////////////////////////////////////////
// Purpose:      Musix server main program
// Created:      21.08.2016 (dd.mm.yyyy)
/////////////////////////////////////////////////////////////////////////////


var config = require('config');
var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var jayson = require('jayson');
var mysql = require('mysql');

var database = require("./database");

var jsonParser = bodyParser.json();


function parseParams(args, names) {
	if (!Array.isArray(names)) {
		throw 'Parameter names must be an array';
	}	
	if (Array.isArray(args)) {
		return mapPositionalParams(args, names);
	} else {
		return mapNamedParams(args, names);
	}
}

function mapPositionalParams(args, names) {
	// FIXME: Check if args has all the properties from names
	var obj = { };
	for (var i = 0; i < names.length; i++) {
		obj[names[i]] = args[i];
	}
	return obj;
}

function mapNamedParams(args, names) {
	//FIXME: Check if args has all properties defined in names
	return args;
}


var api = jayson.server({
	now: function(args, callback) {
		database.now(function(err, data) {
			callback(err, data);
		});
	},
	getArtistsDelta: function(args, callback) {
		var params = parseParams(args, ["since"]);
		database.getArtistsDelta(params.since, function(err, artists) {
			callback(err, artists);
		});
	}
});









var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'client')));

router.use('/jsonrpc', jsonParser);
router.use('/jsonrpc', api.middleware());

router.get('/', function(req, res) {
  res.send('Hello World!');
});




router.get("/artists", function(req, res) {
    pool.getConnection(function(err, connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }  

        console.log('connected as id ' + connection.threadId);
       
        connection.query("select * from artist", function(err, rows){
            connection.release();
            if (!err) {
                res.json(rows);
            }          
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;    
        });
  });
});



router.get("/artists2", function(req, res) {
	database.getArtistsDelta("2014-04-02T00:00:00", function(err, artists) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}
		res.json(artists);
	});
});






server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Musix server listening at", addr.address + ":" + addr.port);
});

