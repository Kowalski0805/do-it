exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');

    table.string('email');
    table.index('email');

    table.string('password');

    table.string('avatar');

    table.string('thumbnail');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
