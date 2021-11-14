function encodeRegistrationToken(userID) {
    // jsonweb automatically adds a key that determines the time, but you can use any module
    var jwt = require('jsonwebtoken');
    var dateNow = new Date();
    // The information we need to find our user in the database (not sensible info)
    var info = { id: userID, time: dateNow.getTime() };
    // The hash we will be sending to the user
    var token = jwt.sign(info, "angularescrow");
    return token;
}
// let token:string = encodeRegistrationToken();
function decodeRegistrationToken(token) {
    var jwt = require('jsonwebtoken');
    var decoded = jwt.verify(token, "angularescrow");
    var userId = decoded.id;
    // Check that the user didn't take too long
    var dateNow = new Date();
    var tokenTime = decoded.iat * 1000;
    // Two hours
    var hours = 2;
    var tokenLife = hours * 60 * 1000;
    // User took too long to enter the code
    if (tokenTime + tokenLife < dateNow.getTime()) {
        return {
            expired: true
        };
    }
    // User registered in time
    return {
        userId: userId
    };
}
module.exports = { encodeRegistrationToken: encodeRegistrationToken, decodeRegistrationToken: decodeRegistrationToken };
