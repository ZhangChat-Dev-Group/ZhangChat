/**
 * File: sqlite.js.
 */

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
const util = require('util')

var DB = DB || {};    //这个代码有点多余，直接用{}不行么？——小张

DB.SqliteDB = function (file) {
    DB.db = new sqlite3.Database(file);

    DB.exist = fs.existsSync(file);
    if (!DB.exist) {
        fs.openSync(file, 'w');
    };
};

DB.printErrorInfo = function (err) {
    console.error("Error Message:" + err.message);
};

DB.SqliteDB.prototype.createTable = function (sql) {
    DB.db.serialize(function () {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err);
                return;
            }
        });
    });
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function (sql, objects) {
    DB.db.serialize(function () {
        var stmt = DB.db.prepare(sql);
        for (var i = 0; i < objects.length; ++i) {
            stmt.run(objects[i]);
        }

        stmt.finalize();
    });
};

DB.SqliteDB.prototype.queryData = function (sql, callback) {
    DB.db.all(sql, function (err, rows) {
        if (null != err) {
            DB.printErrorInfo(err);
            return;
        }

        /// deal query data.
        if (callback) {
            callback(rows);
        }
    });

};

DB.SqliteDB.prototype.awaitQueryData = function (sql) {
    return util.promisify(DB.db.all).call(DB.db, sql);

};

DB.SqliteDB.prototype.executeSql = function (sql) {
    DB.db.run(sql, function (err) {
        if (null != err) {
            DB.printErrorInfo(err);
        }
    });
};

DB.SqliteDB.prototype.close = function () {
    DB.db.close();
};

/// export SqliteDB.
exports.SqliteDB = DB.SqliteDB;