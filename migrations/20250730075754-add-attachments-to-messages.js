"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.addColumn(
    "support_messages",
    "attachment_url",
    { type: "string" },
    function (err) {
      if (err) return callback(err);
      db.addColumn(
        "support_messages",
        "attachment_type",
        { type: "string" },
        function (err) {
          if (err) return callback(err);
          db.changeColumn(
            "support_messages",
            "message",
            { type: "text", notNull: false },
            callback
          );
        }
      );
    }
  );
};

exports.down = function (db, callback) {
  db.removeColumn("support_messages", "attachment_url", function (err) {
    if (err) return callback(err);
    db.removeColumn("support_messages", "attachment_type", function (err) {
      if (err) return callback(err);
      db.changeColumn(
        "support_messages",
        "message",
        { type: "text", notNull: true },
        callback
      );
    });
  });
};

exports._meta = {
  version: 1,
};
