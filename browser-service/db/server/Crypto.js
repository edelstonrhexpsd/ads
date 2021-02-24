require('dotenv').config();
class Crypto{

    static  decrypt(encrypted) {
        const crypto = require('crypto');
        const decipher = crypto.createDecipher('aes192', process.env.CRYPTO_PASS);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        if( decrypted.length == 66 ){
            decrypted = decrypted.substring(2);
        }
        return decrypted;
    }

    static  encrypt( word) {
        const crypto = require('crypto');
        const cipher = crypto.createCipher('aes192', process.env.CRYPTO_PASS);
        let encrypted = cipher.update(word, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

}

module.exports = Crypto;