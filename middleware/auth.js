const jwt = require('jsonwebtoken');
const config = require('config');

//everytime need to access a protected route, need to bring in middleware(auth.js)

module.exports = function(req, res, next){
    //get token from header
    //access header with req
    //x-auth-token = key of token inside header
    const token = req.header('x-auth-token');

    //check if not token
    //401 - unauthorized access
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    try {
        //once verify, payload will be put into decoded
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}