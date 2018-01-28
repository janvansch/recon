const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');

//const {Transaction} = require('../utils/transaction');
// const {ReconDoc} = require('../utils/reconDoc');

// Add commission transaction to recon doc
function appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, callback) {
  var result;

  Recon.findOneAndUpdate(
    {
      'providerCode': providerCode,
      'finPeriod': finPeriod,
      'policyNumber': policyNumber
    },
    {
      'providerCode': providerCode,
      'finPeriod': finPeriod,
      'policyNumber': policyNumber,
      // 'comData.aggrCommAmount': 0,
      // 'comData.aggrVatAmount': 0,
      // 'comData.aggrBrokerFeeAmount': 0,
      // 'comData.aggrMonthCommissionAmount': 0,
      // 'comData.aggrPremiumAmount': 0,
      $push: {"comData.comTransactions": trxEntry}
    },
    {
      upsert: true,
      new: true
    },
    (err, numAffected, raw) => {
      if (err) {
        console.log("TRX save error: ", err );
        var err = true;
        var result = "";
      }
      else {
        // console.log(`err: ${err}, numAffected: ${numAffected}, raw: ${raw}`);
        err = "";
        result = true;
        // console.log(`TRX appended result - err: ${err}, result: ${result}`);
    }
      callback(err, result);
    }
  );
}

function processTrx (dataType, providerCode, finPeriod, policyNumber, trxEntry, callback) {
  if (dataType == "COM") {
    appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
      if (!result) {
        console.log(">>>> ERROR: COM TRX append failed", trxEntry);
        result = false;
      }
    });
    // console.log("===> COM TRX doc appended");
    result = true;
    callback(result);
  }
  else if (type == "IM") {
    appendImTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
      if (!result) {
        console.log(">>>> ERROR: IM TRX append failed", trxEntry);
        result = false;
      }
    });
    console.log("===> IM TRX doc appended");
    result = true;
    callback(result);
  }
}

// save data loaded
var processFileData = (fileData, callback) => {
  // var fileDataObj = JSON.parse(fileData); // convert JSON text into JS object
  var regData = fileData.reg;
  var trxData = fileData.trx.data; // an array of transactions
  var hexId = new ObjectID().toHexString();
  var userId = "DummyId-1234567890a";
  var docCount = trxData.length;
  var dataType = regData.dataType;
  var providerCode = regData.providerCode;
  // var loadPeriod = regData.year + regData.period;
  var policyNumber;
  var regEntry;
  var trxEntry;
  // var reconDocExist;
  // var trxDocument = {};
  // var result;
  var res = "200";

  // console.log("---> File data body: ", fileData);
  // console.log("---> File data reg: ", regData);
  // console.log("---> File data trx: ", trxData);
  console.log("---> Doc Count: ", docCount);

  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  regEntry = new File(regData);

  // Save File Register Entry
  regEntry.save().catch((e) => {
    res = "400";
    callback(res);
  });

  // Process file data
  for (var i = 0, j = docCount; i < j; i++) {
    trxEntry = trxData[i];
    policyNumber = trxEntry.policyNumber;
    trxEntry.loadFile_id = hexId;
    finPeriod = trxEntry.fiscalPeriod;

    console.log(`---> Trx number: ${i}, Recon key - Provider: ${providerCode}, Period: ${finPeriod}, Policy: ${policyNumber}.`);

    processTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (success) => {
      if (!success) {
        // console.log("---> Trx process failed", trxEntry);
        console.log("---> Trx process failed", dataType, providerCode, finPeriod, policyNumber);
        res = "400";
        callback(res);
      }
      console.log("---> Trx processed");

    });
  } // End of file data processing loop
  console.log("<---- File data processing complete ----> ");

  //
  // calculate a control total of transactions value and write to the files doc.
  //
  callback(res);
} // end of saveFileData function

module.exports = {processFileData};
