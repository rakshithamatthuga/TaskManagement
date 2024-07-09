const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
    static verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded.id);
                }
            });
        });
    }
}
module.exports=AuthService

