'use strict';
/**************************************
 * ComPro Server Code - Version 14    *
 * Johannes van Schalkwyk             *
 * Nimble Design (nimbledesign.co.za) *
 * c:\Node\ComPro\backend\index14.js  *
 **************************************/
//
// Setup Library Links
//
var mysql = require('mysql'),
    // ws = require('websocket.io'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs')
;
/******************************************************************************
 * Start a web server on port 8888. Requests go to the handleRequest function *
 ******************************************************************************/
var httpServer = http.createServer(handleRequest).listen(8888);
console.log('<<< Server Started - listening on port 8888 >>>');

/***************************************
 * Function that handles HTTP requests *
 ***************************************/
function handleRequest(request, response) {
	// Load HTML page code
	fs.readFile('../frontend/index14.html', 'utf8', function(err, page) {

        if (err) {
	        response.write('Could not find or open file for reading\n');
	    }
	    else {
            console.log("URL:", request.url);
	        var pathname = url.parse(request.url).pathname;
	        /****************************************
             * Root in accordance to requested path *
             ****************************************/
            switch (pathname) {
                case '/postFileReg': // First Stage = receive file register data via AJAX POST requests
                    /***************************************************
                     * Create File Register entry in DB (POST request) *
                     ***************************************************/
    	            var requestBody = '';
    	            // var postParameters;
    	            request.on('data', function(data) {
    	                requestBody += data;
    	            });
    	            request.on('end', function() {
    	                console.log("Request: ", requestBody);
    	                // Create process date ...
    	                var procDate = '';
    	                var currentDate = new Date();
    	                var day = currentDate.getDate();
    	                var month = currentDate.getMonth() + 1;
    	                var year = currentDate.getFullYear();
    	                procDate = year + month + day;
    	                // ... and add process date to request
    	                requestBody += '&proc_date=' + procDate;
    	                // console.log("Extended Req: ", requestBody);
    	                var fileRegData = querystring.parse(requestBody);
    	                // console.log("Req string: ", fileRegData);
    	                // Update file register data
    	                storeFileRegData(fileRegData, function(regEntryID) {
                            //
                            // File register entry created with key = regEntryID,
                            // now request frontend to send the transaction data
                            //
                            // The response can be either - 
                            //      "stage":"send", "info":"record index" or 
                            //      "stage":"done", "info":"file register table content in HTML"
                            //
    	                	var dataRequest = '{"stage":"two","info":"' + regEntryID + '"}|""';
                            // console.log(">>> Reg Update Response: >>>", dataRequest);
    	                	response.writeHead(200, {'Content-Type': 'text/html'});
    				    	response.end(dataRequest);
    	                });
    	            });
                break;
	            case '/postTrxData': // Second Stage - receive file data via AJAX POST requests
                    /***************************************************************
	                 * Store file data as transaction entries in DB (POST request) *
	                 ***************************************************************/
    	            var requestBody = '';
                    //
    	            // Receive data from frontend and build data structure
                    //
    	            request.on('data', function(data) {
    	                requestBody += data;
    	            });
    	            request.on('end', function() {
                        //
    	                // Store transaction data in Compro DB in transaction data table
                        // and then validate data against the data rules with stored proc. 
                        //
                        // Create parameters for function calls below
                        // console.log("<<< Request Received: ", requestBody);
                        var ReqBody = JSON.parse(requestBody); // convert JSON string into JS object 
                        console.log("<<< Request Body OBJ >>> ", ReqBody);
                        //
                        // Call function to store file data in DB
                        //
                        storeFileData(ReqBody, function(trxResult) {
                            console.log(">>> SAVE RESULT - TRX data:", trxResult);
                            if (trxResult == 'err') {
                                alert("DB ERROR has occurred") 
                            }
                            else { // stage two complete, get file register display data
                                //
                                // Get updated file register data to update file register view
                                //
                                getFileRegData(request, function(contents) {
            				        console.log(">>> READ RESULT - Reg Table: ", contents);
                                    //
                                    // Contents contains the file register data formatted as a HTML table
                                    //

            				        // var fileRegUpdate = '{"stage":"done","info":"' + contents + '"}';
                                    var fileRegUpdate = '{"stage":"done"}|"' + contents + '"';
                                    console.log(">>> REQUEST RESPONSE - Reg Update:", fileRegUpdate);
            				        response.writeHead(200, {'Content-Type': 'text/html'});
                					response.end(fileRegUpdate);
            				    });
                            }
                        });
                    });
                break;

                case '/getTrxData': // Transaction data request via AJAX
                    /********************************************************
                     * Extract transaction record(s) from DB (POST request) *
                     ********************************************************/
                    //
                    // Receive request data
                    //
    	            var requestBody = '';
    	            request.on('data', function(data) {
    	                requestBody += data;
    	            });
    	            request.on('end', function() {
    	                // console.log("TRX Request String: ", requestBody);
						var objReqBody = querystring.parse(requestBody)
						// console.log("TRX Request Object: ", objReqBody);
                        //
    	                // Call function to extract requested data from DB
                        //
    	                getTrxData(objReqBody, function(trxData) {
                            // console.log(">>> Transaction data response: >>>", trxData);
    	                	response.writeHead(200, {'Content-Type': 'text/html'});
    				    	response.end(trxData);
    	                });
    	            });
                break;

                case '/getRefData': // Reference Data request via AJAX
                    /********************************************************
                     * Extract transaction record(s) from DB (POST request) *
                     ********************************************************/
    	            var requestBody = '';
    	            // var postParameters;
    	            request.on('data', function(data) {
    	                requestBody += data;
    	            });
    	            request.on('end', function() {
    	                console.log("Ref Data request string: ", requestBody);
						var dataRequest = querystring.parse(requestBody)
						console.log("Ref data request object: ", dataRequest);
    	                //
                        // Call function to extract data from DB
                        //
                        extractRefData(dataRequest, function (refData){
    	                    // console.log(">>> Reg Update Response: >>>", refData);
    	                	response.writeHead(200, {'Content-Type': 'text/html'});
    				    	response.end(refData);
    	                });
    	            });
                break;

                    case '/updateTrx': // Apply changes to Trx record
                    /********************************************************
                     * Extract transaction record(s) from DB (POST request) *
                     ********************************************************/
    	            var requestBody = '';
    	            // var postParameters;
    	            request.on('data', function(data) {
    	                requestBody += data;
    	            });
    	            request.on('end', function() {
    	                /* console.log("Ref Data request string: ", requestBody);
						var dataRequest = querystring.parse(requestBody)
						console.log("Ref data request object: ", dataRequest);
    	                //
                        // Call function to extract data from DB
                        //
                        extractRefData(dataRequest, function (refData){
    	                    // console.log(">>> Reg Update Response: >>>", refData); */
                        var refData = 'Test Done'
    	                	response.writeHead(200, {'Content-Type': 'text/html'});
    				    	response.end(refData);
    	                //});
    	            });
                break;

                default: // When browser opens 
                    // User selected another view (GET request to /)
	        	    // Call function to extract the required file register data
    				getFileRegData(request, function(contents) {
                        // contents is an HTML string
    				    // console.log(">>> File Reg Table (HTML string): ", contents);
    				    // Update file register view
    				    response.writeHead(200, {'Content-Type': 'text/html'});
    				    // Poor man's templating system: Replace "DBCONTENT" in page HTML with
    				    // the actual content we received from the database
    				    //response.write(pageContent.replace('DBCONTENT', contents));
    				    // response.write(page);
    				    response.write(page.replace('DBCONTENT', contents));
    				    response.end();
    				});
                break;
            }
        }
    });
}
/*****************************************************************************************
 * Below are the functions that support the servicing of requests received by the server *
 *****************************************************************************************/

/*************************************************************************************
 * Function that is called by the code that handles the "/" route and retrieves file *
 * register content from the the database, applying a filter if one was supplied     *
 *************************************************************************************/
function getFileRegData(request, callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'ComProdb'
    });
    var query;
    var resultsAsString = '';
    var fileReg = '';
    //
    // Create header for load file register display
    //
    fileReg += '<table id="fileReg" cellpadding="0" cellspacing="0"><tr>';
    fileReg += '<th>File ref</th>'; 
    fileReg += '<th>Source</th>';
    fileReg += '<th>Loaded by</th>';
    fileReg += '<th>Period</th>'; 
    fileReg += '<th>Year</th>'; 
    fileReg += '<th>Date loaded</th>'; 
    fileReg += '<th>Trx count</th>'; 
    fileReg += '<th>Warnings</th>'; 
    fileReg += '<th>Errors</th>'; 
    fileReg += '<th>Valid</th>'; 
    fileReg += '<th>Adjustments</th>'; 
    fileReg += '<th>Deleted</th>'; 
    fileReg += '<th>Complete</th>'; 
    fileReg += '<th>In use</th>'; 
    fileReg += '<th>User</th>';
    fileReg += '</tr>';

    //
    // Extract Filter - All, Default or Specified
    //
    var filter = querystring.parse(url.parse(request.url).query).filter;
    if (filter == 1) {
        //
        // All data view selected, extract all file register data, no WHERE clause required
        //
        query = connection.query('SELECT * FROM dat_comm_file_reg');    
    }
    else {
        //
        // Else build WHERE clause parameters form the extract
        //
        if (filter == 2) {
            // User specified view selected, read filter parameter values for WHERE clause
            var fromYear = querystring.parse(url.parse(request.url).query).fromYear;
            var toYear = querystring.parse(url.parse(request.url).query).toYear;
            var fromPeriod = querystring.parse(url.parse(request.url).query).fromPeriod;
            var toPeriod = querystring.parse(url.parse(request.url).query).toPeriod;
        }
        else {
            //
            // Default view selected build parameters for WHERE clause
            //
            var currentDate = new Date();
            var fromYr = currentDate.getFullYear();
            var toYr = fromYr;
            var fromPer = currentDate.getMonth() - 1;
            if (fromPer < 1) {
                fromPer = 12 - fromPer;
                fromYr = fromYr - 1;
            };        
            var toPer = currentDate.getMonth() + 1;
            if (toPer > 12) {
                toPer = toPer - 12;
                toYr = toYr + 1;
            };
            fromYear = fromYr.toString();
            toYear = toYr.toString();
            if (fromPer < 10) {
                fromPeriod = "0" + fromPer.toString();
            }
            else {
                fromPeriod = fromPer.toString();
            }
            if (toPer < 10) {
                toPeriod = "0" + toPer.toString();
            }
            else {
                toPeriod = toPer.toString();
            }
        }
        console.log("Filter & Query Params: ", filter, fromYear, toYear, fromPeriod, toPeriod);
        //
        // Extract file register data with the parameters in the WHERE statement
        //
        query = connection.query('SELECT * FROM dat_comm_file_reg WHERE ' +
                                        'rem_year BETWEEN ' + fromYear + ' AND ' + toYear +
                                        ' AND ' +
                                        'rem_per BETWEEN ' + fromPeriod + ' AND ' + toPeriod
        );
    }
    query.on('error', function(err) {
        console.log('A database error occured:');
        console.log(err);
    });
    
    query.on('result', function(result) {
        /*
            With every result, build the file register table definition HTML string.
            The table definition HTML string is later inserted into the HTML of the DOM
	        Note: the result is returned as an object 
        */
        console.log("Read File Reg data:", result);
        fileReg += '<tr>';
        fileReg += '<td>' + result.file_id + '</td>';
        fileReg += '<td>' + result.source + '</td>';
        fileReg += '<td>' + result.user_id + '</td>';
        fileReg += '<td>' + result.rem_per + '</td>';
        fileReg += '<td>' + result.rem_year + '</td>';
        fileReg += '<td>' + result.proc_date + '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' + 
                        'onmouseout="ChangeColor(this, false);" ' + 
                        'onclick="getTrxDetail(' + result.file_id + ', 6)">' + 
                        result.load_count + 
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' + 
                        'onmouseout="ChangeColor(this, false);" ' + 
                        'onclick="getTrxDetail(' + result.file_id + ', 7)">' + 
                        result.warning_count +
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' + 
                        'onmouseout="ChangeColor(this, false);" ' + 
                        'onclick="getTrxDetail(' + result.file_id + ', 8)">' + 
                        result.error_count + 
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' +
                        'onmouseout="ChangeColor(this, false);" ' +
                        'onclick="getTrxDetail(' + result.file_id + ', 9)">' +
                        result.valid_count +
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' +
                        'onmouseout="ChangeColor(this, false);" ' +
                        'onclick="getTrxDetail(' + result.file_id + ', 10)">' +
                        result.adj_count +
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' +
                        'onmouseout="ChangeColor(this, false);" ' +
                        'onclick="getTrxDetail(' + result.file_id + ', 11)">' + 
                        result.del_count +
                    '</td>';
        fileReg += '<td onmouseover="ChangeColor(this, true);" ' +
                        'onmouseout="ChangeColor(this, false);" ' +
                        'onclick="getTrxDetail(' + result.file_id + ', 12)">' + 
                        result.done + 
                    '</td>';
        fileReg += '<td>' + result.in_use + '</td>';
        fileReg += '<td>' + result.in_use_by + '</td>';
        fileReg += '</tr>';
    });
    //
    // When we have worked through all results, we call the callback with the completed table
    //
    query.on('end', function(result) {
        connection.end();
        fileReg += '</table>';
        callback(fileReg); // The result table as a HTML string
    });
}

/**********************************************************************
 * Function that is called by the code that handles the /postFileReg  *
 * route and inserts the supplied string as a new file register entry *
 **********************************************************************/
function storeFileRegData(content, callback) {
    //
    // Connect to DB
    //
    var connection = mysql.createConnection( {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'ComProdb'
    });
    console.log("DB Data: ", content);
    //
    // Send request to DB server
    //
    connection.query('INSERT INTO dat_comm_file_reg SET ?', content, function(err, result) {
        //
        // Use '?' to prevent an SQL injection attack
        //
        if (err) {
            console.log('Could not insert content "' + content + '" into database.');
            console.log("DB error: ", err);
        }
        //
        // result is an object of DB information
        //
        console.log("DB result: ", result);
        var x = result.insertId;
        var y = x.toString();
        console.log("<<< Insert ID >>>", x, y);
        //
        // Execute the callback function
        //
        callback(y);
    });
}

/*******************************************************************
 * Store file content, apply validation rule and record deviations *
 *******************************************************************/
function storeFileData(objFileData, callback) {
    
    /*
        Want to rework this function to use callbacks not query.on
        Also replace the record by record DB calls with a bulk call
        Also split save and validate into seperate functions
    */
    
    //
    // connect to DB
    //
    console.log(">>> CONNECTING TO DB <<<");
    var connection = mysql.createConnection( {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'ComProdb'
    });
    connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    });
    console.log(">>> DB UPDATE STARTED <<<");
    var callbackQ1,
        callbackQ2;
    //
    // Begin transaction
    //
    connection.beginTransaction(function(err) {
        if (err) { //throw err; 
        }
        //
        // For each data row format the data for insert into table
        var query1,
            query2,
            rowData = '',
            rowString = '',
            queryString = [],
            x = '',
            recId = '';
        //
        // Start saving file data row by row
        //
        /*************************************
         * Start saving file data row by row *
         *************************************/
        for (var r = 0, n = objFileData.data.length; r < n; r++) {
            rowData = objFileData.data[r]
            rowString = querystring.stringify(rowData);
            console.log(">>> Row String Content: ", rowString);
            queryString = querystring.parse(rowString);
            console.log(">>> Row Query String >>> ", queryString);
            //
            // Send row data to DB server for storage
            //
            query1 = connection.query('INSERT INTO dat_transaction_data SET ?', queryString);
            query1.on('error', function(err) {
                console.log('>>> Q1 - DB error: ', err);
                callbackQ1 = 'err';
                return connection.rollback(function() {
                    console.log('<<ERR>> @ TRX insert - Rollback ');
                });
            });
            query1.on('result', function(result) {
                // console.log('>>> Q1 - Data received from Db:',result);
                x = result.insertId;
                recId = x.toString();
                console.log("<<< TRX Record ID >>>", x, recId);
                callbackQ1 = 'ok';
            });
            query1.on('end', function(result) {
                console.log('<--- TRX success! --->');
                // connection.end();
                //callback(result);
            });
        }
        //
        // End of saving file data row by row loop
        //
        /**********************************
         * Apply validation rules to data *
         **********************************/
        console.log(">>> VALIDATING <<<");
        //
        // Create Process ID
        //
        var date = new Date();
        var components = [
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];
        var processId = components.join("");
        //
        // Get register file Id
        //
        var fileId = objFileData.data[0].file_id;
        //
        // Create string with stored procedure parameter data: fileId INT(25), procId BIGINT(64)
        //
        var params = "'" + fileId + "', '" + processId + "'";
        console.log("File ID:", fileId, "Proc ID:", processId);
        //
        // Call stored procedure to validate and create audit transaction entries
        //
        query2 = connection.query('CALL data_validation(' + params + ')');
        
        query2.on('error', function(err) {
            console.log('>>> Q2 - DB error:', err);
            callbackQ2 = 'err';
            return connection.rollback(function() {
                console.log('<<ERR>> @ data validation - Rollback');
            });
        }); 

        query2.on('result', function(result) {
            console.log('>>> Data received from Db:', result);
            callbackQ2 = 'ok';
        });

        query2.on('end', function(result) {
            connection.commit(function(err) {
                if (err) {
                    return connection.rollback(function() {
                        console.log('<<ERR>> @ Commit - Rollback');
                    });
                }
            });
            console.log('<--- Validation success! --->');
            connection.end();
            console.log(">>> DB CONNECTION CLOSED <<<");
        });
    });
    if (callbackQ1 == 'err' || callbackQ2 == 'err') {

        callback(callbackQ2);    
    }
    else {
        callback(callbackQ2);
    }
    console.log(">>> TRX STORE DONE <<<");
}

/***********************************************************
 * Get the transaction data content requested by front-end *
 ***********************************************************/
function getTrxData(requestBody, callback) {
    //
    // Connect to DB
    //
    var connection = mysql.createConnection( {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'ComProdb'
    });
    //
    // setup
    //
    var fileId = requestBody.fileId,
        column = requestBody.col,
        state = '',
        trxQuery = '',
        trxData = '',
        messageStr = '',
        messages = [],
        mCode = '',
        mText = '',
        mString = [],
        jMessages = '',
        jTrxText = '',
        trxDataString = '';

    console.log(">>> File Id:", fileId);
    console.log(">>> Column:", column);

    //
    // Determine type of content required
    //
    switch (column) {
        case '6': state = 'A'; break; // select all records loaded with file ignoring state
        case '7': state = 'W'; break; // select file records in warning state
        case '8': state = 'E'; break; // select file records in error state
        case '9': state = 'V'; break;// select file records in valid state
        case '10': state = 'A'; break; // select all adjustment records
        case '11': state = 'X'; proc_type = 'J'; break; // select all deleted records
        case '12': state = 'S'; break; // select all exported for remuneration calculation
        default: state = 'A';
    }
	console.log(">>> TRX Query - File/Column/State:", fileId, column, state);
    //
    // Prepare SQL Query
    //
    if (state != 'X') {
        // get transactions by state
        if (state == 'A') { // All records loaded regardless of state
            var sql = "SELECT * " + 
						"FROM dat_transaction_data JOIN adt_trx_proc_state " +
                        "ON dat_transaction_data.file_id = adt_trx_proc_state.file_id " +
                            "AND dat_transaction_data.trx_id = adt_trx_proc_state.trx_id " +
                        "WHERE ?? = ?";
            var inserts = ['dat_transaction_data.file_id', fileId];
            sql = mysql.format(sql, inserts);
        }
        else {
            var sql = "SELECT * " +
						"FROM dat_transaction_data JOIN adt_trx_proc_state " +
                        "ON dat_transaction_data.file_id = adt_trx_proc_state.file_id " +
                            "AND dat_transaction_data.trx_id = adt_trx_proc_state.trx_id " +
                        "WHERE ?? = ? AND ?? = ?";
            var inserts = ['dat_transaction_data.file_id', fileId, 'adt_trx_proc_state.trx_proc_state', state];
            sql = mysql.format(sql, inserts);    
        }
    }
    else { // get adjustment transactions
        var sql = "SELECT * " +
					"FROM dat_transaction_data JOIN adt_trx_proc_state " +
                    "ON dat_transaction_data.file_id = adt_trx_proc_state.file_id " +
                        "AND dat_transaction_data.trx_id = adt_trx_proc_state.trx_id " +
                    "WHERE ?? = ? AND ?? = ?";
        var inserts = ['dat_transaction_data.file_id', fileId, 'adt_trx_proc_state.trx_proc_state', proc_type];
        sql = mysql.format(sql, inserts);    
    }
    //
    // Send query to DB
    //
    trxQuery = connection.query(sql);
    //
    // If an error occurs
    //
    trxQuery.on('error', function(err) {
        console.log('>>> TRX Query - A database error occured:');
        console.log(err);
        callback = 'err';
    });
    //
    // Received info from DB
    //
    trxQuery.on('result', function(result) {

        // console.log('>>> Data obj received from Db: ', result);

        //
        // Create callback result in a JSON string format
        // Result row contains transaction data, processing data and messages
        //
        jTrxText = '{' +
            //
            // Extract transaction data and format into JSON format string
            //
            '"trx_id":"' + result.trx_id + '", ' +
            '"file_id":"' + result.file_id + '", ' +
            '"trx_type":"' + result.trx_type + '", ' +
            '"insurance_co_code":"' + result.insurance_co_code + '", ' +
            '"marketers_code":"' + result.marketers_code + '", ' +
            '"source_code":"' + result.source_code + '", ' +
            '"policy_no":"' + result.policy_no + '", ' +
            '"policy_holder":"' + result.policy_holder + '", ' +
            '"initials":"' + result.initials + '", ' +
            '"commission_type":"' + result.commission_type + '", ' +
            '"commission_amount":"' + result.commission_amount + '", ' +
            '"vat_amount":"' + result.vat_amount + '", ' +
            '"broker_fee_amount":"' + result.broker_fee_amount + '", ' +
            '"month_commission_amount":"' + result.month_commission_amount + '", ' +
            '"revised_policy_no":"' + result.revised_policy_no + '", ' +
            '"premium_amount":"' + result.premium_amount + '", ' +
            '"line_of_business":"' + result.line_of_business + '", ' +
            '"branch_agent":"' + result.branch_agent + '", ' +
            '"period":"' + result.period + '", ' +
            '"marketers_code_2":"' + result.marketers_code_2 + '", ' +
            '"marketers_code_3":"' + result.marketers_code_3 + '", ' +
            '"marketers_code_4":"' + result.marketers_code_4 + '", ' +
            //
            // Extract processing data and format into JSON format
            //
            '"proc_id":"' + result.proc_id + '", ' +
            '"seq_id":"' + result.seq_id + '", ' +
            '"proc_type":"' + result.proc_type + '", ' +
            '"trx_proc_state":"' + result.trx_proc_state + '", ' +
            '"user_id":"' + result.user_id + '", '
        ;

        // console.log("TRX before messages", jTrxText);

        //
        // Read messages string, split individual message into an array
        //
        messageStr = result.message;
        // console.log(">>> Message string: ", messageStr);
        messages = messageStr.split(',');
        // console.log(">>> Messages array: ", messages);
        //
        // Create JSON messages string
        //
        mString = '';
        var mLen = messages.length; // the number of messages too process
        // console.log(">>> Messages Length: ", mLen);
        for (var m = 0; m < mLen; m++) {
            mCode = messages[m].substring(1, messages[m].indexOf(":"));
            // console.log("mCode: ", mCode)
            mText = messages[m].substring((messages[m].indexOf(":")+2), (messages[m].length)-1);
            // console.log("mText: ", mText);
            mString += '{"Code":"' + mCode + '", "Text":"' + mText + '"},';
            // console.log(">>> mString: ", mString);
        }
        var jMessages = '"messages" : [' + mString.substr(0, mString.length-1) + ']';
        // console.log(">>> JSON Format Messages: ", jMessages);
        //
        // Add messages string to transaction string
        //
        jTrxText = jTrxText + jMessages + '},';

        // console.log('>>> JSON format transaction: ', jTrxText);
        trxDataString = trxDataString + jTrxText;
        jTrxText = '';
    });
    //
    // Request complete close DB connection
    //
    trxQuery.on('end', function(result) {
        //
		// Return data retrieved from data base
		//
		// console.log('>>> Query Result Returned: ', jTrxText);
        trxData = '{ "trxData" : [' + trxDataString.substr(0, trxDataString.length-1) + ']}';
        console.log(">>> JSON Format TRX Result: ", trxData);
		callback(trxData);
		connection.end();
        console.log(">>> DB CONNECTION CLOSED <<<");
    });
}

/*******************************************************
 * Get reference data from DB Server for local storage *
 *******************************************************/
//
// All SQL information is retained on the server, i.e. no SQL
// requests are received from the client or send to the client
//
function extractRefData(dataRequest, callback) {
    //
    // setup
    //
    var refData = {},
        refDataString = '',
        jRefData = '',
        request = dataRequest.req
    ;
    //
    // Process reference data request
    //
    switch (request) {
        case 'company': // provider reference data requested
            //
            // Prepare query for product provider data extract (S01)
            //
            // var sql = "SELECT ins_co_code, LOB_Code, PROVIDER_Name, PROVIDER_Active_Ind, Provider_BookType" +
            var sql = "SELECT * FROM dat_prod_provider";
            var inserts = [];
            sql = mysql.format(sql, inserts);
            console.log('<<< Provider ref data request >>>');
            //
            // Call function to extract reference data from db
            //
            dbRead(sql, function (result){
                // console.log(">>> Provider request result: ", result);
                //
                // Extract reference data from result and format into JSON string
                //
                for (var i = 0; i < result.length; i++) {
                    refData = '{' +
                        '"coCode":"' + result[i].ins_co_code + '", ' +
                        '"lob":"' + result[i].LOB_Code + '", ' +
                        '"coName":"' + result[i].PROVIDER_Name + '", ' +
                        '"active":"' + result[i].PROVIDER_Active_Ind + '", ' +
                        '"bookType":"' + result[i].Provider_BookType + '"' +
                    '},';
                    refDataString = refDataString + refData;
                    refData = '';
                }
                //
                // Return reference data as a JSON string
                //
                //console.log('>>> Query Result Returned: ', result);
                jRefData = '{ "refData" : [' + refDataString.substr(0, refDataString.length-1) + ']}';
                //console.log(">>> JSON Format TRX Result: ", jRefData);
                callback(jRefData);
            });
        break;

        case 'adviser': // agent reference data requested
            //
            // Prepare query for Agent Profile data extract (S03, 17, 18 & 19)
            //
            // var sql = "SELECT 'adviser_code', 'adviser_full_name'" +
            var sql = "SELECT * FROM dat_agent_profile";
            var inserts = [];
            sql = mysql.format(sql, inserts);
            console.log('<<< Agent ref data request >>>');
            //
            // Call function to extract reference data from db
            //
            dbRead(sql, function (result){
                //
                // Callback: Extract reference data from result and format into JSON string
                //
                // console.log(">>> Agent request result: ", result);
                for (var i = 0; i < result.length; i++) {
                    refData = '{' +
                            '"advCode":"' + result[i].adviser_code + '", ' +
                            '"advName":"' + result[i].adviser_full_name + '"' +
                        '},';
                        refDataString = refDataString + refData;
                        refData = '';
                }
                //
                // Return reference data as a JSON string
                //
                //console.log('>>> Query Result Returned: ', result);
                jRefData = '{ "refData" : [' + refDataString.substr(0, refDataString.length-1) + ']}';
                //console.log(">>> JSON Format TRX Result: ", jRefData);
                callback(jRefData);
            });
        break;

        case 'agent': // Entity Link reference data requested
            //
            // 3 Entity relationship S15
            // valid combinations of branch agent code, company code and adviser code
            //
            // var sql = "SELECT 'branch_agent_code', 'ins_co_code', 'adviser_code', 'active'" +
	    	var sql = "SELECT * FROM dat_entity_link";
            var inserts = [];
            sql = mysql.format(sql, inserts);
            console.log('<<< Combo ref data request >>>');
            //
            // Call function to extract reference data from db
            //
            dbRead(sql, function (result){
                // console.log(">>> Combo request result: ", result);
                //
                // Extract reference data from result and format into JSON string
                //
                for (var i = 0; i < result.length; i++) {
                    refData = '{' +
                        '"branchAgentCode":"' + result[i].branch_agent_code + '", ' +
                        '"coCode":"' + result[i].ins_co_code + '", ' +
                        '"advCode":"' + result[i].adviser_code + '", ' +
                        '"active":"' + result[i].active + '"' +
                    '},';
                    refDataString = refDataString + refData;
                    refData = '';
                }
                //
                // Return reference data as a JSON string
                //
                //console.log('>>> Query Result Returned: ', result);
                jRefData = '{"refData" : [' + refDataString.substr(0, refDataString.length-1) + ']}';
                //console.log(">>> JSON Format TRX Result: ", jRefData);
                callback(jRefData);
            });
        break;
        default:
            throw err;
    }
}

//
// Read data from DB Server
//
function dbRead(request, callback) {
    //
    // Connect to DB
    //
    var connection = mysql.createConnection( {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'ComProdb'
    });
    //
    // Send SQL query to DB Server
    //
    connection.query(request, function(err, rows){
        if(err) throw err;
        //
		// Return data retrieved from data base
		//
		console.log('>>> Query Result Returned: ', rows);
        callback(rows);
		connection.end();
        console.log(">>> DB CONNECTION CLOSED <<<");
        
    });
}
