function encodeRegistrationToken(userID:string)
{
    // jsonweb automatically adds a key that determines the time, but you can use any module
    const jwt = require('jsonwebtoken');
    const dateNow = new Date();
    // The information we need to find our user in the database (not sensible info)
    let info = {id: userID, time:dateNow.getTime()};

    // The hash we will be sending to the user
    const token:string = jwt.sign(info, "angularescrow");

    return token;
}

// let token:string = encodeRegistrationToken();
function decodeRegistrationToken(token:string)
{   
    const jwt = require('jsonwebtoken');
    let decoded = jwt.verify(token, "angularescrow");

    let userId = decoded.id;

    // Check that the user didn't take too long
    let dateNow = new Date();
    let tokenTime = decoded.iat * 1000;

    // Two hours
    let hours = 2;
    let tokenLife = hours * 60 * 1000;

    // User took too long to enter the code
    if (tokenTime + tokenLife < dateNow.getTime())
    {
        return {            
            expired: true
        };
    }

    // User registered in time
    return {
        userId
    };

}

module.exports = { encodeRegistrationToken, decodeRegistrationToken}