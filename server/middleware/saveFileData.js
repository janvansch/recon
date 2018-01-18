const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');

const {transaction} = require('../utils/transaction');

var saveFileData = (fileData) => {
  // var fileDataObj = JSON.parse(fileData); // convert JSON text into JS object
  var regData = fileData.reg;
  var trxData = fileData.trx.data;
  var hexId = new ObjectID().toHexString();
  var userId = "1234567890a";
  var providerCode = regData.providerCode;
  var dataType = regData.dataType;
  var finPeriod = regData.year + regData.period;
  var docCount = trxData.length;
  // var policyNumber;
  var regEntry;
  var trxEntry;
  // var trxDocument = {};
  var res;

  // console.log("---> File data body: ", fileData);
  console.log("---> File data reg: ", regData);
  console.log("---> File data trx: ", trxData);

  // Setup Register Entry
  regData.userId = userId;
  regData._id = hexId;
  console.log("---> Register data with _id: ", regData);
  regEntry = new File(regData);

  console.log("---> Register data to save: ", regEntry);

  // Save Register Entry
  regEntry.save().catch((e) => {
    return res = "400";
  });

  for (var doc = 0, d = docCount; doc < d; doc++) {
    trxEntry = trxData[doc];
    trxEntry.loadFile_id = hexId;
    console.log(`---> Trx doc number ${doc}: `, trxEntry);

    // Setup Recon Transaction
    var trxDocument = new transaction(dataType, providerCode, finPeriod, trxEntry);
    console.log("---> Transaction Document: ", trxDocument);

    // Upsert Recon Transaction
    Recon.findOneAndUpdate(
      {
        'providerCode': providerCode,
        'finPeriod': finPeriod,
        'policyNumber': trxEntry.policyNumber
      },
      {$set: trxDocument},
      {upsert: true,
      new: true},
      (err, numAffected, raw) => {
        if (err) {
          console.log("Save error: ", err );
        }
        console.log(`TRX saved: `, numAffected, raw );
      }
    )
  }
  return res = "200";
};

module.exports = {saveFileData};
