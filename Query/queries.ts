
let TEMP_USER_QUERIES =  {
    INSERT_USERS: "INSERT INTO tempusers (public_id,firstname,middlename,lastname,email,telephone,\
                    bankname,bvn,acc_no,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    MIGRATE_USERS: "SELECT * FROM tempusers WHERE public_id=?;",
    DELETE_USER:  "DELETE FROM tempusers WHERE public_id=?;",
    CHECK_EMAIL_EXISTS: "SELECT email FROM tempusers WHERE email=?",
    CHECK_BVN_EXISTS: "SELECT bvn from tempusers WHERE bvn=?",
    CHECK_ACC_NO_EXISTS: "SELECT acc_no from tempusers WHERE acc_no=?",

     }

     
let USER_QUERIES =  {
    INSERT_USERS: "INSERT INTO users (public_id,firstname,middlename,lastname,email,telephone,\
                    bankname,bvn,acc_no,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    GET_USER:     "SELECT * FROM users WHERE public_id=?;",
    DELETE_USERS: "DELETE FROM users WHERE public_id=?;",
    CHECK_EMAIL_EXISTS: "SELECT email FROM users WHERE email=?",
    CHECK_BVN_EXISTS: "SELECT bvn from users WHERE bvn=?",
    CHECK_ACC_NO_EXISTS: "SELECT acc_no from users WHERE acc_no=?",
    GET_EMAIL_PASS: "SELECT public_id,email,password FROM users WHERE email=?"

     }

let ORDER_POOL_QUERIES =  {
    PUBLISH_ORDER: "INSERT INTO orderpools (order_id,order_publisher,commodity,quantity,price,timestamp,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?)",
    CLEAN_ORDER_TABLE: `DELETE FROM orderpools WHERE (?-timestamp)/(60*60)/1000 >=0.05;`,            
    RESERVE_ORDER_DATA: "SELECT * from orderpools WHERE order_id=?;",
    GET_PARTIES: "SELECT order_id,order_publisher WHERE order_id=?;"

    }

let PROC_POOL_QUERIES =  {
    RESERVE_ORDER: "INSERT INTO proc_pools (proc__id,order__publisher,order__handler,commodity,quantity,price,timestamp,reserved_timestamp,createdAt,updatedAt,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    CHECK_ORDER_EXISTS: `SELECT proc__id FROM proc_pools WHERE proc__id=?;`,            
    USER_HAS_UNCOMPLETED_TRANSACTION: "SELECT order__handler from proc_pools WHERE order__handler=?;",
    CLEAN_PROC_POOL: "DELETE FROM proc_pools WHERE (?-reserved_timestamp)/(60*60)/1000 >=0.01;",
    INSERT_SELLER_TOKEN: "UPDATE proc_pools SET seller_token = ? WHERE proc__id = ?;",
    GET_HANDLER_ID: "SELECT order__handler from proc_pools WHERE proc__id=?;",
    VERIFY_TOKEN_RECIPIENT:"SELECT proc__id,order__publisher,order__handler,seller_token from proc_pools WHERE proc__id = ?;",
    ORDER_TABLE_VERIFY_TOKEN:"SELECT seller_token FROM proc_pools WHERE proc__id = ?;",
    INCOGNITO_VERIFY_TOKEN:"SELECT seller_token FROM proc_pools WHERE seller_token = ?;",
    UPDATE_STATUS: "UPDATE proc_pools SET status = ? WHERE proc__id = ?;",
    GET_PARTIES: "SELECT proc__id,order__publisher,order__handler WHERE order__publisher=?;"

        }


let INCOGNITO_POOL_QUERIES =  {            
    USER_HAS_UNCOMPLETED_TRANSACTION: "SELECT order__handler from proc_pools WHERE order__handler=?;",
    CLEAN_PROC_POOL: "DELETE FROM proc_pools WHERE (?-reserved_timestamp)/(60*60)/1000 >=0.01;",
    INSERT_SELLER_TOKEN: "INSERT INTO incognitopools (proc__id,order__publisher,price,seller_token,createdAt,updatedAt VALUES(?,?,?,?,?,?)",
    GET_HANDLER_ID: "SELECT order__handler from proc_pools WHERE proc__id=?;",
    VERIFY_TOKEN_RECIPIENT:"SELECT proc__id,order__publisher,order__handler,seller_token from proc_pools WHERE proc__id = ?;",
    ORDER_TABLE_VERIFY_TOKEN:"SELECT seller_token FROM proc_pools WHERE proc__id = ?;",
    INCOGNITO_VERIFY_TOKEN:"SELECT seller_token FROM proc_pools WHERE seller_token = ?;",

        }
let PAYMENT_POOL_QUERIES = {
    INSERT_BENEFICIARY:"INSERT INTO paymentpools (payment_ref,order_id,order_publisher,amount,timestamp,createdAt,updatedAt VALUES(?,?,?,?,?,?,?)",
    GET_PARTIES: "SELECT order_publisher,amount WHERE payment_ref=?;"

    }
    
let BANK_QUERIES =  {            
    CREATE_RECIPIENT: "INSERT INTO bankaccounts (public_id,bankname,bank_code,account_no,account_name,recipient_code,timestamp,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)",
    GET_RECIPIENT: "SELECT public_id,recipient_code FROM bankaccounts WHERE public_id =?;"
        }

module.exports ={
                
                TEMP_USER_QUERIES,
                USER_QUERIES,
                ORDER_POOL_QUERIES,
                PROC_POOL_QUERIES,
                INCOGNITO_POOL_QUERIES,
                PAYMENT_POOL_QUERIES,
                BANK_QUERIES}
                