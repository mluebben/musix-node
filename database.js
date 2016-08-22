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

module.exports = {
	now: function(callback) {
		return _now(callback);
	},
    getArtistsDelta: function(since, callback) { 
		return _getArtistsDelta(since, callback);
	}
}

var config = require('config');
var mysql = require('mysql');

var dbConfig = config.get('dbConfig');
var pool = mysql.createPool(dbConfig);

function _now(callback) {
	_query("SELECT NOW()", callback);
}

function _getArtistsDelta(since, callback) {
	console.log("_getArtistDelta: " + since);

	var table = "artist";
    var idColumns = [ "idArtist" ];
    var columns = [ "idArtist", "strArtist", "strBorn", "strFormed", "strGenres", "strMoods", "strStyles", "strInstruments", "strBiography", "strDied", "strDisbanded", "strYearsActive", "dtAdded" ];

	var sql = _getDeltaSql(table, idColumns, columns);

	
	
	
	
	
	
	
	_query(sql, callback);
	
	//_query("select * from artist", callback);
	
	/*
    pool.getConnection(function(err, connection) {
        if (err) {
          //res.json({"code" : 100, "status" : "Error in connection database"});
		  callback(err, null);
          return;
        }  

        console.log('connected as id ' + connection.threadId);
       
        connection.query("select * from artist", function(err, rows){
            connection.release();
            if (!err) {
                // res.json(rows);
				callback(null, rows);
            }
        });

        connection.on('error', function(err) {      
              //res.json({"code" : 100, "status" : "Error in connection database"});
			  callback(err, null);
              return;    
        });
  });
  */
  
};




function _getDeltaSql(table, idColumns, columns) {
	var projection1 = [ ];
	var projection2 = [ ];

	projection1.push("'U' AS changetype");
	for (var i = 0; i < columns.length; i++) {
		projection1.push("`" + columns[i] + "`");
	}

	projection2.push("'D' AS changetype");
	for (var i = 0; i < columns.length; i++) {
		var column = columns[i];
		if (idColumns.indexOf(column) > -1) {
			projection2.push("`" + column + "`");
		} else {
			projection2.push("NULL AS `" + column + "`");
		}
	}

	var sql = "";
	sql = "SELECT " + projection1.join(", ");
	sql += " FROM " + table;
	sql += " WHERE dtRowLastModified > @since";

	sql += " UNION ALL";
	sql += " SELECT " + projection2.join(", ");
	sql += " FROM xsync__" + table + "_histlog";
	sql += " WHERE dtDeleted > @since";

	return sql;
}




function _query(sql, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
          //res.json({"code" : 100, "status" : "Error in connection database"});
		  callback(err, null);
          return;
        }  

        console.log('connected as id ' + connection.threadId);
       
        connection.query(sql, function(err, rows){
            connection.release();
            if (!err) {
                // res.json(rows);
				callback(null, rows);
            }
        });

        connection.on('error', function(err) {      
              //res.json({"code" : 100, "status" : "Error in connection database"});
			  callback(err, null);
              return;    
        });
  });
}
