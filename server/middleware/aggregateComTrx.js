const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');

//const {Transaction} = require('../utils/transaction');
const {ReconDoc} = require('../utils/reconDoc');

var aggregateComTrx = (fileData) => {
  // var fileDataObj = JSON.parse(fileData); // convert JSON text into JS object
  var regData = fileData.reg;
  var trxData = fileData.trx.data; // an array of transactions
  var hexId = new ObjectID().toHexString();
  var userId = "1234567890a";
  var docCount = trxData.length;
  var dataType = regData.dataType;
  var providerCode = regData.providerCode;
  var finPeriod = regData.year + regData.period;
  var policyNumber;
  var regEntry;
  var trxEntry;
  var reconDocExist;
  // var trxDocument = {};
  var result;

  // console.log("---> File data body: ", fileData);
  // console.log("---> File data reg: ", regData);
  console.log("---> File data trx: ", trxData);
  console.log("---> Doc Count: ", docCount);

  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  regEntry = new File(regData);

  // Save File Register Entry
  regEntry.save().catch((e) => {
    return res = "400";
  });

  // Verify recon docs, if not found create placeholder doc
  for (var i = 0, j = docCount; i < j; i++) {

    trxEntry = trxData[i];
    policyNumber = trxEntry.policyNumber;
    trxEntry.loadFile_id = hexId;
    // Check if recon doc exists
    console.log(`--->  Verify Recon doc number: ${i}, Search key ->  Provider: ${providerCode}, Period: ${finPeriod}, Policy: ${policyNumber}.`);
    //console.log(`---> Verify Recon doc number: ${i} for policy: ${policyNumber}`);
    docExists(providerCode, finPeriod, policyNumber, trxEntry, (found, providerCode, finPeriod, policyNumber, trxEntry) => {
      if (!found) {
        // No recon doc found, insert new recon doc
        console.log('---> Recon not found, create one', providerCode, finPeriod, policyNumber);
        reconDoc = new ReconDoc(providerCode, finPeriod, policyNumber);
        createReconDoc(reconDoc, (created) => {
          if (!created) {
            console.log(">>> Error - Recon doc creation failed");
            result = false;
          }
        });
      }
      else {
        console.log("---> Recon doc found");

      }
    });
  }



  return result = "200"
}

module.exports = {saveFileData};
