exports= {}
var SqlString = require('sqlstring');

// SQL queries handler function
function parseSql(presql:string,parameters:any){

    var sql =  SqlString.format(presql,parameters)
    console.log('The Query ',sql)
    return sql

}

module.exports = [ parseSql ]
// 