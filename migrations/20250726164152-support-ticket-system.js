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
  db.createTable(
    "support_tickets",
    {
      id: { type: "int", primaryKey: true, autoIncrement: true },
      user_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "support_tickets_user_id_fk",
          table: "users",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "RESTRICT",
          },
          mapping: "id",
        },
      },
      manager_id: { type: "bigint" },
      status: { type: "string", notNull: true, defaultValue: "pending" }, // pending, in_progress, closed
      created_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
    },
    function (err) {
      if (err) return callback(err);
      db.createTable(
        "support_messages",
        {
          id: { type: "int", primaryKey: true, autoIncrement: true },
          ticket_id: {
            type: "int",
            notNull: true,
            foreignKey: {
              name: "support_messages_ticket_id_fk",
              table: "support_tickets",
              rules: {
                onDelete: "CASCADE",
                onUpdate: "RESTRICT",
              },
              mapping: "id",
            },
          },
          sender_id: { type: "bigint", notNull: true },
          sender_type: { type: "string", notNull: true }, // user, manager
          message: { type: "text", notNull: true },
          created_at: {
            type: "timestamp",
            notNull: true,
            defaultValue: new String("CURRENT_TIMESTAMP"),
          },
        },
        callback
      );
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("support_messages", function (err) {
    if (err) return callback(err);
    db.dropTable("support_tickets", callback);
  });
};

exports._meta = {
  version: 1,
};
