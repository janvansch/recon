/*******************************************
 * File load and display functions section *
 *******************************************/
//
//==================================================
//  Start file load process with options selected
//==================================================
function loadData() {
  console.log("Load Data started");
  //
  // determine file name
  //
  var filename = document.getElementById("fileUpload");
  //
  // determine file type
  //
  var radioButton = document.getElementsByName("dataSource");
  for (var j=0; j < radioButton.length; j++) {
      if (radioButton[j].checked) {
          var dataSource = radioButton[j].value;
          console.log(">>> Data Source:", dataSource);
      }
  }
  //
  // determine the selected delimiter
  //
  var radioButton = document.getElementsByName("fileDelimiter");
  for (var j=0; j < radioButton.length; j++) {
      if (radioButton[j].checked) {
          var cellDelimiter = radioButton[j].value;
          console.log(">>> Delimiter:", cellDelimiter);
      }
  }
  if (dataSource == 0) {
    //
    // load file data definition
    //
    var fileRules = readRules(dataSource);
    var listPrompt = 'Data list - Place File data';
  }
  else if (dataSource == 1) {
    //
    // load file data definition
    //
    var fileRules = readRules(dataSource);
    var listPrompt = 'Data list - MI data';
  }
  //
  // Extract data from file and display
  //
  readData(filename, cellDelimiter, fileRules, (fileData) => {
    displayData(fileData, listPrompt, fileRules);
  });
}
//========================================================
// Extract file data from text file and load into an array
//========================================================
function readData(fileUpload, cellDelimiter, objRules, callback) {
  //
  // Extract data from selected file
  //
  var fileData = [];
  var rowCount = 0;
  var columnCount = 0;
  var columnRule = objRules.filedef.length;

  console.log(">>> Number of columns:", columnRule);

  // var fileUpload = document.getElementById("fileUpload");
  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/; // a regular expression
  if (regex.test(fileUpload.value.toLowerCase())) {
      if (typeof (FileReader) !== "undefined") {
          var reader = new FileReader();
          reader.onload = function (e) { // e = the current event
              //
              // split file at line break into rows
              //
              var rows = e.target.result.split("\n"); // rows is an array of file rows
              //
              // determine the number of rows
              //
              rowCount = rows.length;
              //
              // Check for blank last rows
              //
              if (rows[rowCount] == null) {
                rowCount = rowCount - 1;
              }
              //
              // select split method
              //
              if (cellDelimiter == 0) {
                  var splitter = ",";
              }
              else {
                  var splitter = ";";
              }
              for (var i = 0; i < rowCount; i++) {
                  //
                  // cells is an array of the content of the cells of a row
                  //
                  var cells = rows[i].split(splitter);
                  //
                  // detemine the number of columns
                  //
                  columnCount = cells.length;
                  // console.log("Number of Columns vs. Expected", columnCount, columnRule);
                  //
                  // Validate that number of columns ara correct
                  //
                  // try {
                  //     if (columnCount != columnRule) throw "Number of columns incorrect";
                  // }
                  // catch(err) {
                  //     console.log("Error: " + err);
                  //     alert("column error");
                  // }
                  //
                  // Validate cell data type and size
                  //
                  // for (var j = 0; j < columnCount; j++) {
                  //     var nodeContent = cells[j].trim();
                  //     var typeRule = objRules.filedef[j].datatype;
                  //     var lenRule = objRules.filedef[j].size;
                  //     try {
                  //         if (typeRule == "string") {
                  //             if (!isString(nodeContent)) throw "Data Error: String expected";
                  //             if (!(nodeContent.length <= lenRule)) throw "Data Error: length incorrect";
                  //         }
                  //         else {
                  //             if (!isNumber(nodeContent)) throw "Data Error: Number expected";
                  //            // if (!(nodeContent.length <= lenRule)) throw "Data Error: Number expected";
                  //         }
                  //     }
                  //     catch(err) {
                  //         console.log("Error: " + err);
                  //     }
                  //}
                  // Load row with node data into array
                  fileData.push(cells); // insert cells array into rows array

              } // end of row processing

              // console.log(">>> File Data 2", fileData);
              //return (fileData
              callback(fileData);

          } // end of file read function definition
          reader.readAsText(fileUpload.files[0]);
      } // end of if
      else {
          alert("This browser does not support HTML5.");
      }
  }
  else {
      alert("Please upload a valid CSV file.");
  }
}
//=================================================
// Create table to display list content in DOM
//=================================================
function displayData(listContent, listPrompt, objRules) {
  var rowCount = listContent.length;
  var dataColCount = listContent[0].length;
  var colCount = objRules.filedef.length;
  if (colCount !== dataColCount) {
    console.log(`==> Err: Column Count issue: expected = ${colCount} data = ${dataColCount}`);
    alert(`==> Err: Column Count issue: expected = ${colCount} data = ${dataColCount}`);
  }
  //
  // creates a table element
  //
  var table = document.createElement('table');
  //
  // Give table an id to reference it
  //
  table.setAttribute('id','dataList');
  //
  // create header
  //
  var header = table.createTHead();
  //
  // create header row
  //
  var headerRow = header.insertRow(0);
  //
  // create cells and insert label content
  //
  for (var j = 0; j < colCount; j++) {
      var headerCell = headerRow.insertCell(-1);
      headerCell.innerHTML = objRules.filedef[j].label;
  }
  //
  // create body
  //
  var body = table.createTBody();
  //
  //
  // create a body row for each data row
  //
  for (var i = 0; i < rowCount; i++) {
      //
      // insert a body row for each data row
      //
      var tableRow = body.insertRow(-1);
      //
      // insert a cell for each data column
      //
      for (var j = 0; j < colCount; j++) {
          //
          // insert a cell
          //
          var tableCell = tableRow.insertCell(-1);
          //
          // handle the &amp problem in name and initials
          //
          if (j == 4 || j == 5) {
              listContent[i][j] = listContent[i][j].replace(/&/g, '%26');
              // "/&/g" = regular expression to replace all
              // "/&/gi" = regular expression to replace all, not case sensitive
          }
          //
          // insert cell content
          //
          tableCell.innerHTML = listContent[i][j].trim();
          // tableCell.innerHTML = listContent[i][j];
      } // end of column loop
  } // end of row loop
  // console.log(">>> Data display table created", table);
  //
  // Insert Table into DOM for display
  //
  var tablePos = document.getElementById("tablePos");
  tablePos.innerHTML = "";
  tablePos.appendChild(table); // add child element to document
  //
  // Update list section heading
  //
  if (listPrompt !== null){
  document.getElementById("dList").innerHTML = listPrompt;
  }
  console.log("<<< Data list display updated >>>");
}
//================================================
// Send loaded file data to server
//================================================
function commitFileData() {
  //
  // Send file register document to the server.
  // Server will create the file register document and save the
  // recon data with a reference to file register entry.
  //
  extractFileData((dataPayload) => {
    var method = "POST";
    var route = "/saveFileData";
    serverRequest(method, route, dataPayload, (resp) => {
      // if (!resp == 200) {
      //   alert("Data send failed.");
      // }
      console.log("---> Commit file data result: ", resp);
    });
  });
}
//=============================================
// Extract file data from DOM
//=============================================
function extractFileData(callback) {
  //
  // determine file type
  //
  var radioButton = document.getElementsByName("dataSource");
  for (var j=0; j < radioButton.length; j++) {
      if (radioButton[j].checked) {
          var dataSource = radioButton[j].value;
          console.log(">>> Data Source:", dataSource);
      }
  }
  //
  // decode dataType
  //
  if (dataSource == 0) {
    var dataType = "COM";
  }
  else {
    var dataType = "IM";
  }
  //
  // Read file definition for file type
  //
  var objRules = readRules(dataSource);
  console.log("File def:", objRules);
  var timestamp = new Date().getTime();
  //
  // Get DOM data
  //
  var filename = document.getElementById("fileUpload");
  var input = document.getElementsByName("fileRegData");
  console.log("Input data:", input[0].value, input[1].value, input[2].value);
  var trxTable = document.getElementById("dataList");
  console.log("Data List Table:", trxTable);
  var rowCount = trxTable.rows.length;
  console.log("Data List Table rows:", rowCount);
  var cellCount = trxTable.rows[0].cells.length;
  console.log("Data List Table cells:", cellCount);
  //
  // Create file register document as an object
  //
  var fileRegData = {
    providerCode : input[0].value,
    dataType : dataType,
    filename : filename,
    period : input[1].value,
    year : input[2].value,
    timestamp : timestamp,
    recordCount : rowCount
  };
  //
  // convert file register document to a JSON string
  //
  var fileRegJson = JSON.stringify(fileRegData);
  // console.log("===> File Register JSON: ", fileRegJson);
  //
  // Extract transaction data from DOM table and convert to a JSON string
  //
  var objTrxData = {
      'data': []
  };
  for (var row = 1, r = rowCount; row < r; row++) { // Ignore header row
    var tmpTrxData = {};
    for (var cell = 0, c = cellCount; cell < c; cell++) {
      //
      // Fill object data array with extracted data rows
      //
      var key = objRules.filedef[cell].fname;
      var data = trxTable.rows[row].cells[cell].innerHTML;
      // console.log(">>> Cell Info ", key, data);
      tmpTrxData[key] = data;
    }
    //console.log(">>> tmp data ", tmpTrxData);
    objTrxData.data.push(tmpTrxData);
  }
  // console.log("===> Data obj:", objTrxData);
  var jsonTrxData = JSON.stringify(objTrxData.data);
  // console.log("===> JSON Data: ", jsonTrxData);
  //
  // Create server message data string
  //
  var dataExtract = {
    file : fileRegData,
    transactions : objTrxData
  };
  var dataContent = JSON.stringify(dataExtract);
  console.log("===> JSON Data: ", dataContent);
  return callback(dataContent);
}
//================================================
// Send request to server
//================================================
function serverRequest(method, route, payload, callback) {
  //
  // Set up connection to server
  //
  var xhttp;
  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  }
  else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  //
  // Monitor request state changes reported by server
  //
  xhttp.onreadystatechange = function() {
    console.log("Ready state:", xhttp.readyState);
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      //
      // Request complete and successful response from server
      //
      var response = xhttp.status;
      console.log("response:", response);
      callback(response);
    }
  }
  xhttp.open(method, route);
  // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.setRequestHeader("Content-type", "text/html");
  xhttp.send(payload);
}
//
// Function that return the data definitions as an object
//
function readRules(dataSource) {
  // var placeFileDef = require("place-file-def.json"); ??????
  if (dataSource == 0) {
    // string with JSON syntax
    var jText = '{ "filedef" : [' +
      '{ "fname" : "productProviderCode" , "label" : "Product Provider Code" , "datatype" : "string" , "size" : "3" , "required" : "true" },' +
      '{ "fname" : "marketersCode" , "label" : "Marketers Code" , "datatype" : "string" , "size"  :"8" , "required" : "false" },' +
      '{ "fname" : "sourceCode" , "label" : "Source Code" , "datatype" : "string" , "size" : "20" , "required" : "true" },' +
      '{ "fname" : "policyNumber" , "label" : "Policy Number" , "datatype" : "string" , "size" : "15", "required" : "true" },' +
      '{ "fname" : "policyHolder" , "label" : "Policy Holder" , "datatype" : "string" , "size" : "50" , "required" : "false" },' +
      '{ "fname" : "initials" , "label" : "Initials" , "datatype" : "string" , "size" : "8" , "required" : "false" },' +
      '{ "fname" : "commissionType" , "label" : "Commission Type" , "datatype" : "string" , "size" : "2" , "required" : "false" },' +
      '{ "fname" : "commissionAmount" , "label" : "Commission Amount" , "datatype" : "number" , "size" : "12" , "required" : "true" },' +
      '{ "fname" : "vatAmount" , "label" : "VAT Amount" , "datatype" : "number" , "size" : "12" , "required" : "false" },' +
      '{ "fname" : "brokerFeeAmount" , "label" : "Policy Fee" , "datatype" : "number" , "size":"12" , "required" : "false" },' +
      '{ "fname" : "monthCommissionAmount" , "label" : "Monthly Commission" , "datatype" : "number" , "size" : "12" , "required" : "false" },' +
      '{ "fname" : "revisedPolicyNumber" , "label" : "Revised Policy Number" , "datatype" : "string" , "size" : "15" , "required" : "false" },' +
      '{ "fname" : "premiumAmount" , "label" : "Premium Amount" , "datatype" : "number" , "size" : "12" , "required" : "false" },' +
      '{ "fname" : "lineOfBusiness" , "label" : "Policy Type" , "datatype" : "number" , "size" : "1" , "required" : "false" },' +
      '{ "fname" : "branchAgentCode" , "label" : "Branch Agent Code" , "datatype" : "string" , "size" : "7" , "required" : "true" },' +
      '{ "fname" : "period" , "label" : "Commission Period" , "datatype" : "number" , "size" : "6" , "required" : "false" },' +
      '{ "fname" : "firstReferrer" , "label" : "1st Referrer" , "datatype" : "string" , "size" : "8" , "required" : "false" },' +
      '{ "fname" : "secondReferrer" , "label" : "2nd Referrer" , "datatype" : "string" , "size" : "8" , "required" : "false" },' +
      '{ "fname" : "thirdReferrer" , "label" : "3rd Referrer" , "datatype" : "string" , "size" : "8" , "required" : "false" } ]}'
    ;
  }
  else {
    var jText = '{ "filedef" : [' +
      '{ "fname":"fiscal_period" , "label":"Period" , "datatype":"string" , "size":"3" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
      '{ "fname":"provider_code" , "label":"Provider Code" , "datatype":"string" , "size":"8" , "used":"false" , "edit":"true" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"provider_broker_code" , "label":"Provider Broker Code" , "datatype":"string" , "size":"20" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
      '{ "fname":"sti_pbc" , "label":"STI PBC" , "datatype":"string" , "size":"15" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
      '{ "fname":"policy_number" , "label":"Policy Number" , "datatype":"string" , "size":"50" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"sti_pol" , "label":"STI POL" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"product_group" , "label":"Product Group" , "datatype":"string" , "size":"2" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"product_summary" , "label":"Product Summary" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
      '{ "fname":"contract_period_from" , "label":"Contract Period From" , "datatype":"number" , "size":"12" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"contract_period_to" , "label":"Contract Period To" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"gross_written_prem" , "label":"Gross Written Premium" , "datatype":"number" , "size":"12" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"gross_earned_prem" , "label":"Gross Earned Premium" , "datatype":"string" , "size":"15" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"gross_written_comm" , "label":"Gross Written Commission" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
      '{ "fname":"gross_earned_comm" , "label":"Gross Earned Commission" , "datatype":"number" , "size":"1" , "used":"true" , "edit":"false" , "ref":"true" },' +
      '{ "fname":"net_written_prem" , "label":"Net Written Premium" , "datatype":"string" , "size":"7" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
      '{ "fname":"net_earned_prem" , "label":"Net Earned Premium" , "datatype":"string" , "size":"6" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
      '{ "fname":"net_written_comm" , "label":"Net Written Comm" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" },' +
      '{ "fname":"net_earned_comm" , "label":"Net Earned Commission" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" },' +
      '{ "fname":"in_place_file" , "label":"In Place File" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" } ]}'
    ;
  }
  var obj = JSON.parse(jText); // convert JSON text into JS object
  // var obj = JSON.parse(placeFileDef); // convert JSON text into JS object
  console.log("Place File Definition: ", obj);
  return obj;
}

/*********************
 * General Utilities *
 *********************/
//
// disable & enable form
//
function formDisable() {
    // Call to disable -> document.getElementById("btnPlaceOrder").disabled = true;
    var limit = document.forms[0].elements.length;
    for (i=0;i < limit; i++) {
       document.forms[0].elements[i].disabled = true;
    }
};
function formEnable() {
    // Call to enable  -> document.getElementById("btnPlaceOrder").disabled = false;
    var limit = document.forms[0].elements.length;
    for (i=0;i < limit; i++) {
       document.forms[0].elements[i].disabled = false;
    }
}
//
// Highlight a row/cell in a table
//
function ChangeColor(tableRow, highLight) {
    if (highLight) {
        // tableRow.style.backgroundColor = '#dcfac9';
        tableRow.style.backgroundColor = '#F7B733';
    }
    else {
        tableRow.style.backgroundColor = 'white';
    }
}
//
// Test if data item is a string
//
function isString(o) {
    return typeof o == "string" || (typeof o == "object" && o.constructor === String);
};
//
// Test if data item is a string
//
function isNumber(o) {
    return typeof o == "number" || (typeof o == "object" && o.constructor === Number);
}
//
// DOM edit functions by https://www.scribd.com/document/2279811/DOM-Append-Text-and-Elements-With-Javascript
//
// add text to existing element
//
function appendText(node,txt) {
    node.appendChild(document.createTextNode(txt));
}
//
// Add new element
//      node = element where to add new element
//      tag = the type of element to add
//      id = optional id for element
//      htm = optional internal html text for element
//
function appendElement(node,tag,id,htm) {
    var ne = document.createElement(tag);
    if(id) ne.id = id;
    if(htm) ne.innerHTML = htm;
    node.appendChild(ne);
}
function addElementBefore(node,tag,id,htm) {
    var ne = document.createElement(tag);
    if(id) ne.id = id;
    if(htm) ne.innerHTML = htm;
    node.parentNode.insertBefore(ne,node);
}
function addElementAfter(node,tag,id,htm) {
    var ne = document.createElement(tag);
    if(id) ne.id = id;
    if(htm) ne.innerHTML = htm;
    node.parentNode.insertBefore(ne,node.nextSibling);
}
