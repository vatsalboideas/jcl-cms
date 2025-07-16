import * as crypto from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

function encrypt(text) {
  var encrypted = crypto.AES.encrypt(text, ENCRYPTION_KEY)
  return encrypted
}

function decrypt(hash) {
  var decrypted = crypto.AES.decrypt(hash, ENCRYPTION_KEY)
  return decrypted.toString(crypto.enc.Utf8)
}

module.exports = {
  dbEncrypt: encrypt,
  dbDecrypt: decrypt,
}
