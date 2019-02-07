module.exports.up = function(knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.integer('user_id');
    table.foreign('user_id').references('id').inTable('users');

    table.string('token');
    table.index('token');

    table.timestamp('expires');
  });
};

module.exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
