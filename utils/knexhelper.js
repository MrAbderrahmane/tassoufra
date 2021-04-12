const Knex = require("knex");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./db.sqlite3",
  },
  useNullAsDefault: true,
});

function getAllPasswords() {
  console.log("getAllPasswords was called");
  return knex("passwords").select();
}

function savePasswords(obj) {
  console.log("savePasswords was called");
  obj.created_at = knex.fn.now();
  obj.updated_at = knex.fn.now();
  return knex("passwords").insert(obj);
}

function updatePassword(obj) {
  console.log("updatePasswords was called");
  console.log(obj);
  obj.updated_at = knex.fn.now();
  const id = obj.id;
  delete obj.id;
  console.log(obj);
  return knex("passwords").where({id}).update(obj);
}

function getPassword(id) {
  console.log("getPasswords was called");
  return knex("passwords").where("id", id);
}

function deletePassword(id) {
  console.log("deletePasswords was called");
  return knex("passwords").where("id", id).del();
}
function getRandomPassword() {
  return (
    knex("passwords")
      .select()
      .orderByRaw("RANDOM()")
      .limit(1)
  );
}
module.exports = {
  getAllPasswords,
  savePasswords,
  getPassword,
  deletePassword,
  getRandomPassword,
  updatePassword
};

// knex.schema.dropTable('todos').then(r => console.log(r));

/* knex.schema.createTable('passwords',tbl => {
    tbl.increments();
    tbl.string('website',64);
    tbl.text('hashedpassword');
    tbl.timestamps();
}) */

/* knex.schema.createTableIfNotExists('passwords', tbl => {
    tbl.increments();
    tbl.string('website',64);
    tbl.text('hashedpassword');
    tbl.timestamps(); 
}) */

// knex.schema.hasTable('passwords').then(r => console.log(r))

/* knex.schema.hasTable('passwords').then(function(exists) {
    if (!exists) {
        console.log('table dosnt exists')
      return knex.schema.createTable('passwords', function(t) {
        t.increments();
        t.string('website',64);
        t.text('hashedpassword');
        t.timestamps(); 
      });
    }else{
        console.log('table exists')
    }
  }); */

/* knex.schema.createTable("t",t => {
    t.increments();
    t.string('test');
}) */

// knex("todos").insert([
//     { id: 1, tasks: "task 1", urgent: 1 },
//     { id: 2, tasks: "task 2", urgent: 3 },
//     { id: 3, tasks: "task 3", urgent: 5 },
//   ]);
