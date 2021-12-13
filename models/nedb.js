const Datastore = require("nedb");
let db = {};
db.users = new Datastore("users.db");
db.users.loadDatabase();

exports.crUd_ativate = (confirmationToken) => {
  db.users.update(
    {
      confirmationToken: confirmationToken,
    },
    {
      $set: {
        confirm: 1,
      },
    },
    {},
    function (err, nRecords) {
      console.log("Records have been changed ---->" + nRecords);
    }
  );
};

exports.cRud_login = (email) => {
  return new Promise((resolve, reject) => {
    db.users.findOne(
      {
        _id: email,
      },
      (err, user) => {
        if (err) {
          reject({ msg: "There was a problem in the Database!" });
        } else {
          if (user == null) {
            reject({ msg: "User doesn't exist!" });
          } else if (user.confirm != 1) {
            reject({ msg: "Pending activation. Please verify your email!" });
          } else {
            resolve(user);
          }
        }
      }
    );
  });
};

exports.Crud_register = (email, password, confirmationToken) => {
  return new Promise((resolve, reject) => {
    data = {
      _id: email,
      confirm: 0,
      password: password,
      confirmationToken: confirmationToken,
    };
    db.users.insert(data, (err, data) => {
      if (err) {
        reject(null);
      } else {
        resolve(data);
      }
    });
  });
};
