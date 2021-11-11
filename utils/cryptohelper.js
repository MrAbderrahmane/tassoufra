const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16
let encryptionKey; // = process.env.ENCRYPTION_KEY || '827ccb0eea8a706c4c34a16891f84e7b'; // Must be 256 bits (32 characters)

/*
===================================================
======  encryption best practice        ===========
===================================================
*/

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + encrypted.toString("hex"); // + ':'
}

function decrypt(text) {
  // let textParts = text.split(':');
  //console.log(textParts[0].length,textParts);
  let iv = Buffer.from(text.slice(0, 32), "hex"); // textParts.shift()
  let encryptedText = Buffer.from(text.slice(32), "hex"); // textParts.join(':')
  let decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(encryptionKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

// module.exports = { decrypt, encrypt };

/*
===================================================
======  hashing                         ===========
===================================================
*/

function hash(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

/*
===================================================
====== generate random text             ===========
===================================================
*/

/** Sync */
function randomString(length, chars) {
  if (!chars) {
    throw new Error("Argument 'chars' is undefined");
  }

  var charsLength = chars.length;
  if (charsLength > 256) {
    throw new Error(
      "Argument 'chars' should not have more than 256 characters" +
        ", otherwise unpredictability will be broken"
    );
  }

  var randomBytes = crypto.randomBytes(length);
  var result = new Array(length);

  var cursor = 0;
  for (var i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength];
    console.log(randomBytes[i], cursor, cursor % charsLength);
  }

  return result.join("");
}

/** Sync */
function randomAsciiString(length) {
  return randomString(
    length,
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  );
}

function randomPassword(length) {
  return randomString(
    length,
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_&%$@!"
  );
}

// console.log(randomAsciiString(20));
// Returns 'rmRptK5niTSey7NlDk5y' which is 20 characters length.

// console.log(randomString(20, 'ABCDEFG'));
// Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.

//=============================================================

function setEncryptionPassword(newPass) {
  encryptionKey = hash(newPass);
}

function getEncryptionPassword() {
  return encryptionKey;
}

module.exports = {
  encrypt,
  decrypt,
  setEncryptionPassword,
  getEncryptionPassword,
  hash,
};

// const s = encrypt('osidjfoasjfdoasif');
// // encryptionKey = encryptionKey.replace('8','1');
// let w
// try{
//   w = decrypt(s);
// } catch(e){
//   console.log(e);
// }
// console.log(w);
