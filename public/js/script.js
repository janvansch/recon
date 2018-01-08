/*******************************************
 * File load and display functions section *
 *******************************************/
//
// Extract file data from text file and load into an array for processing of the format rules
//
function dataLoad() {
  //
  // load file data definition
  //
    console.log(">>> Started Loading file:");
  var objRules = readRules();
    console.log(">>> File def rules acquired:");
  //
  // Extract data from selected file
  //
  var fileData = [];
  var rowCount = 0;
  var columnCount = 0;
  var fileUpload = document.getElementById("fileUpload");
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
              if (rows[rowCount] !== '') {
                rowCount = rowCount - 1;
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
              //
              // split rows into cells using the selected cell delimiter
              //
              for (var i = 0; i < rowCount; i++) {
                  //
                  // cells is an array of the content of the cells of a row
                  //
                  if (cellDelimiter == 0) {
                      var cells = rows[i].split(",");
                  }
                  else {
                      var cells = rows[i].split(";");
                  }
                  //
                  // detemine the number of columns
                  //
                  columnCount = cells.length;
                  //
                  // Validate that number of columns ara correct
                  //
                  try {
                      if (columnCount != 19) throw "Number of columns incorrect";
                  }
                  catch(err) {
                      console.log("Error: " + err);
                      alert("column error");
                  }
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
              //
              // Display data loaded
              //
              // console.log(">>> Call dispDataList: ", fileData)
              console.log("==> File Data: ", fileData);
              var listPrompt = 'Data list - File data';
              dispDataList(fileData, listPrompt);
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
//
// Create table to display list content in DOM
//
function dispDataList(listContent, listPrompt) {
  //
  // Setup
  //
  var rowCount = listContent.length;
  var colCount = listContent[0].length;
  var objRules = readRules();
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
          //tableCell.innerHTML = listContent[i][j].trim();
          tableCell.innerHTML = listContent[i][j];
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
//
// Execute commit request and store file data
//
function commitFileData() {
    //
    // Send file register data and commission data to server
    // Server will create the file register entry and save the
    // commission data
    //
    // Get the file register input parameters from DOM input
    //
    var input = document.getElementsByName("fileRegData");
    console.log("File Register:", input);
    console.log("Input data:", input[0].value, input[1].value, input[2].value);
    // create send data string
    var fileRegData = "source=" + input[0].value +
                        "&rem_per=" + input[1].value +
                        "&rem_year=" + input[2].value;
    console.log("File Register:", fileRegData);
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
            // Request complete and successful response from server, start stage two
            //
            var response = xhttp.responseText;
            console.log("response:", response);
            var respJ = JSON.parse(response.substring(0, response.indexOf("|")));
            console.log("JSON part of response", respJ);
            var respH = response.substring(response.indexOf("|")+1, response.length);
            console.log("HTML part of response", respH);

            // var response = JSON.parse(xhttp.responseText);
            // var response = JSON.parse(response);
            console.log("send:", response);
            // The response can be either -
            //      "stage":"two", "info":"record index" or
            //      "stage":"done", "info":"file register table content in HTML"
            //
            if (respJ.stage == 'two') {
                //
                // Stage one, create file register entry, is complete.
                // Start stage two to save the file data.
                //
                var objTrxData = {
                    'data': []
                };
                var objRules = readRules();
                var trxTable = document.getElementById("dataList");
                console.log("Data List Table:", trxTable);
                var rowCount = trxTable.rows.length;
                //
                // extract transaction rows from table ignoring the header row
                //
                for (var r = 1, n = trxTable.rows.length; r < n; r++) {
                    //
                    // Fill object data array with extracted data rows
                    //
                    objTrxData.data[r-1] = ({
                        file_id: respJ.info,
                        trx_type: 'F',
                        insurance_co_code: trxTable.rows[r].cells[0].innerHTML,
                        marketers_code: trxTable.rows[r].cells[1].innerHTML,
                        source_code: trxTable.rows[r].cells[2].innerHTML,
                        policy_no: trxTable.rows[r].cells[3].innerHTML,
                        policy_holder: trxTable.rows[r].cells[4].innerHTML,
                        initials: trxTable.rows[r].cells[5].innerHTML,
                        commission_type: trxTable.rows[r].cells[6].innerHTML,
                        commission_amount: trxTable.rows[r].cells[7].innerHTML,
                        vat_amount: trxTable.rows[r].cells[8].innerHTML,
                        broker_fee_amount: trxTable.rows[r].cells[9].innerHTML,
                        month_commission_amount: trxTable.rows[r].cells[10].innerHTML,
                        revised_policy_no: trxTable.rows[r].cells[11].innerHTML,
                        premium_amount: trxTable.rows[r].cells[12].innerHTML,
                        line_of_business: trxTable.rows[r].cells[13].innerHTML,
                        branch_agent: trxTable.rows[r].cells[14].innerHTML,
                        period: trxTable.rows[r].cells[15].innerHTML,
                        marketers_code_2: trxTable.rows[r].cells[16].innerHTML,
                        marketers_code_3: trxTable.rows[r].cells[17].innerHTML,
                        marketers_code_4: trxTable.rows[r].cells[18].innerHTML
                    });
                }
                // console.log("<<< TRX Data Obj >>> ", objTrxData);
                //
                // Now stringify data obj into JSON string for data transfer
                //
                var jTrxData = JSON.stringify(objTrxData);
                // console.log("TRX JSON Data:", jTrxData);
                //
                // Send file data to server
                //
                xhttp.open("POST", "/postTrxData");
                // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                // xhttp.setRequestHeader("Content-type", "text/html");
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(jTrxData);
            }
            else { // response.stage == 'done')
                //
                // Stage two, file data saved and data validation is complete.
                // Stage three is to update file register table display.
                //
                document.getElementById("fileReg").innerHTML = respH;
            }
        }
    }
    //
    // First stage: send file register data to create File Register entry
    //
    xhttp.open("POST", "/postFileReg");
    // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader("Content-type", "text/html");
    xhttp.send(fileRegData);
}
//
// Function that return the data definitions as an object
//
function readRules() {
  // var placeFileDef = require("place-file-def.json");
    // string with JSON syntax
    var jText = '{ "filedef" : [' +
        '{ "fcode":"S01" , "fname":"insurance_co_code" , "label":"Product Provider Code" , "datatype":"string" , "size":"3" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
        '{ "fcode":"S02" , "fname":"marketers_code" , "label":"Marketers Code" , "datatype":"string" , "size":"8" , "used":"false" , "edit":"true" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S03" , "fname":"source_code" , "label":"AGT Code" , "datatype":"string" , "size":"20" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
        '{ "fcode":"S04" , "fname":"policy_no" , "label":"Policy Number" , "datatype":"string" , "size":"15" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
        '{ "fcode":"S05" , "fname":"policy_holder" , "label":"Policy Holder" , "datatype":"string" , "size":"50" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S06" , "fname":"initials" , "label":"Initials" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S07" , "fname":"commission_type" , "label":"Comm Type" , "datatype":"string" , "size":"2" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S08" , "fname":"commission_amount" , "label":"Commission (inclusive)" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
        '{ "fcode":"S09" , "fname":"vat_amount" , "label":"VAT charged" , "datatype":"number" , "size":"12" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S10" , "fname":"broker_fee_amount" , "label":"Policy Fee" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S11" , "fname":"month_commission_amount" , "label":"Monthly Commission" , "datatype":"number" , "size":"12" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S12" , "fname":"revised_policy_no" , "label":"New Policy Number" , "datatype":"string" , "size":"15" , "used":"false" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S13" , "fname":"premium_amount" , "label":"GWP" , "datatype":"number" , "size":"12" , "used":"true" , "edit":"false" , "blank":"true" , "ref":"false" },' +
        '{ "fcode":"S14" , "fname":"line_of_business" , "label":"Policy Type" , "datatype":"number" , "size":"1" , "used":"true" , "edit":"false" , "ref":"true" },' +
        '{ "fcode":"S15" , "fname":"branch_agent" , "label":"Branch Agent Code" , "datatype":"string" , "size":"7" , "used":"true" , "edit":"true" , "blank":"false" , "ref":"true" },' +
        '{ "fcode":"S16" , "fname":"period" , "label":"Commission Period" , "datatype":"string" , "size":"6" , "used":"true" , "edit":"false" , "blank":"false" , "ref":"false" },' +
        '{ "fcode":"S17" , "fname":"marketers_code_2" , "label":"1st Referrer" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" },' +
        '{ "fcode":"S18" , "fname":"marketers_code_3" , "label":"2nd Referrer" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" },' +
        '{ "fcode":"S19" , "fname":"marketers_code_4" , "label":"3rd Referrer" , "datatype":"string" , "size":"8" , "used":"true" , "edit":"true" , "blank":"true" , "ref":"true" } ]}';

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
}
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
}
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
