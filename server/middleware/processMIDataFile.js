"use strict";

const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');
const {sortByAttribute} = require('../utils/sortByAttribute');
// const {isEmpty, isEmptyObj} = require('../utils/isEmpty');

// ===================
//  Update Recon Data
// ===================
function docCommit(providerCode, finPeriod, policyNumber, setData, pushData) {

  // WORKAROUND: for Mongoose problem -
  // can't $set and $push together in one findOneAndUpdate
  // extract aggregation data from $set data and execute individually
  var aggrGrossWrittenPremium = setData.imData.aggrGrossWrittenPremium;
  var aggrGrossEarnedPremium = setData.imData.aggrGrossEarnedPremium;
  var aggrGrossWrittenCommission = setData.imData.aggrGrossWrittenCommission;
  var aggrGrossEarnedCommission = setData.imData.aggrGrossEarnedCommission;
  var aggrNetWrittenPremium = setData.imData.aggrNetWrittenPremium;
  var aggrNetEarnedPremium = setData.imData.aggrNetEarnedPremium;
  var aggrNetWrittenCommission = setData.imData.aggrNetWrittenCommission;
  var aggrNetEarnedCommission = setData.imData.aggrNetEarnedCommission;

  return new Promise((resolve, reject) => {

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
        //"$set": setData,
        'imData.aggrGrossWrittenPremium' : aggrGrossWrittenPremium,
        'imData.aggrGrossEarnedPremium' : aggrGrossEarnedPremium,
        'imData.aggrGrossWrittenCommission' : aggrGrossWrittenCommission,
        'imData.aggrGrossEarnedCommission' : aggrGrossEarnedCommission,
        'imData.aggrNetWrittenPremium' : aggrNetWrittenPremium,
        'imData.aggrNetEarnedPremium' : aggrNetEarnedPremium,
        'imData.aggrNetWrittenCommission' : aggrNetWrittenCommission,
        'imData.aggrNetEarnedCommission' : aggrNetEarnedCommission,

        $push: pushData
      },
      {
        upsert: true,
        new: true
      },
      (err, numAffected, raw) => {
        if (err) {
          console.log(">>>---> TRX save error: ", err.message );
          var err = true;
          var result = "";
          reject(err);
        }
        else {
          // console.log(`err: ${err},
          //   numAffected: ${numAffected.imData},
          //   raw: ${raw}`
          // );
          err = "";
          result = true;
          // console.log(`>>>---> TRX save success -
          //   Provider Code: ${providerCode},
          //   Period: ${finPeriod},
          //   Policy: ${policyNumber}`
          // );
          resolve(result);
        }
      }
    )

  });
}
// ======================================
// Get aggregation values from DB if any
// ======================================
function getAggregation(providerCode, finPeriod, policyNumber) {
  console.log("====> Aggregation parameters", providerCode, finPeriod, policyNumber );
  return new Promise((resolve) => {

    var reconData = {};

    Recon.find(
      {
        "$and": [
          {"providerCode": providerCode},
          {"finPeriod": finPeriod},
          {"policyNumber": policyNumber}
        ]
      },
      {
        _id : 0,
        "imData.aggrGrossWrittenPremium" : 1,
        "imData.aggrGrossEarnedPremium" : 1,
        "imData.aggrGrossWrittenCommission" : 1,
        "imData.aggrGrossEarnedCommission" : 1,
        "imData.aggrNetWrittenPremium" : 1,
        "imData.aggrNetEarnedPremium" : 1,
        "imData.aggrNetWrittenCommission" : 1,
        "imData.aggrNetEarnedCommission" : 1
      }
    )
    .then((recon) => {
      if (recon[0] == null) {
        console.log(">>>---> Path A - IM aggregation: Document not found");
        // No document found, create template for processing
        reconData = {
          providerCode : providerCode,
          finperiod : finPeriod,
          policyNumber : policyNumber,
          imData : {
            aggrGrossWrittenPremium : 0,
            aggrGrossEarnedPremium : 0,
            aggrGrossWrittenCommission : 0,
            aggrGrossEarnedCommission : 0,
            aggrNetWrittenPremium : 0,
            aggrNetEarnedPremium : 0,
            aggrNetWrittenCommission : 0,
            aggrNetEarnedCommission : 0,
            imTransactions : []
          }
        }
        resolve(reconData);
      }
      else {
        // document found
        // A document with the key may exists but does it contain the relevant
        // aggregation data? If not add the Aggregation fields with zero
        // values; else read the values from the DB and return these.
        console.log(">>>---> Path B - IM aggregation: Document found");
        // console.log(`====> Recon IM data returned from DB:
        //   ${recon[0].imData}
        // `);

        //Only one document should be found
        if (recon.length > 1 ){
          console.log("====> ERROR: DB Aggr Find result: ", recon.length, recon);
          reject("Error - more than one document returned, DB error");
        }

        // A document with the search key exists but if it does not
        // contain the relevant aggregation fields, create and assign 0.
        var aggrGrossWrittenPremium = (typeof recon[0].imData.aggrGrossWrittenPremium === 'undefined') ? (0) : (recon[0].imData.aggrGrossWrittenPremium);

        var aggrGrossEarnedPremium = (typeof recon[0].imData.aggrGrossEarnedPremium === 'undefined') ? (0) : (recon[0].imData.aggrGrossEarnedPremium);

        var aggrGrossWrittenCommission = (typeof recon[0].imData.aggrGrossWrittenCommission === 'undefined') ? (0) : (recon[0].imData.aggrGrossWrittenCommission);

        // console.log("<<<1>>> Before conversion:", recon[0].imData.aggrGrossEarnedCommission);
        var aggrGrossEarnedCommission = (typeof recon[0].imData.aggrGrossEarnedCommission === 'undefined') ? (0) : (recon[0].imData.aggrGrossEarnedCommission);
        // console.log("<<<1>>> After conversion, final result:", aggrGrossEarnedCommission);

        var aggrNetWrittenPremium = (typeof recon[0].imData.aggrNetWrittenPremium === 'undefined') ? (0) : (recon[0].imData.aggrNetWrittenPremium);

        var aggrNetEarnedPremium = (typeof recon[0].imData.aggrNetEarnedPremium === 'undefined') ? (0) : (recon[0].imData.aggrNetEarnedPremium);

        var aggrNetWrittenCommission = (typeof recon[0].imData.aggrNetWrittenCommission === 'undefined') ? (0) : (recon[0].imData.aggrNetWrittenCommission);

        var aggrNetEarnedCommission = (typeof recon[0].imData.aggrNetEarnedCommission === 'undefined') ? (0) : (recon[0].imData.aggrNetEarnedCommission);

        // create document object to be return
        reconData = {
          providerCode : providerCode,
          finperiod : finPeriod,
          policyNumber : policyNumber,
          imData : {
            aggrGrossWrittenPremium: aggrGrossWrittenPremium,
            aggrGrossEarnedPremium: aggrGrossEarnedPremium,
            aggrGrossWrittenCommission: aggrGrossWrittenCommission,
            aggrGrossEarnedCommission: aggrGrossEarnedCommission,
            aggrNetWrittenPremium: aggrNetWrittenPremium,
            aggrNetEarnedPremium: aggrNetEarnedPremium,
            aggrNetWrittenCommission: aggrNetWrittenCommission,
            aggrNetEarnedCommission: aggrNetEarnedCommission,
            imTransactions : []
          }
        }
        //console.log(`====> Aggregation data object:
        //  ${reconData[0].imData}
        // `);
        resolve(reconData);
      }
    })
    .catch((e) => {
      console.log("====> ERROR: Aggregation find failed");
      reject(`Error - Aggregation find failed ${e}`);
    })
  });
}
// ==========================
//  Process file data loaded
// ==========================
// var processFileData = async (fileData) => {
var processMIDataFile = async (fileData) => {

  const regData = fileData.reg;
  const trxData = fileData.trx.data; // an array of transactions
  const dataType = regData.dataType;
  const providerCode = regData.providerCode;
  const trxCount = trxData.length;

  const hexId = new ObjectID().toHexString();

  var userId = "DummyId-1234567890a";
  var result = "200";
  var finPeriod;
  var policyNumber;
  var regEntry;
  var trxEntry = [];
  var trx;
  var reconData = [{}];
  var currKey;
  var prevKey;
  var grossWrittenPremium = 0;
  var grossEarnedPremium = 0;
  var grossWrittenCommission = 0;
  var grossEarnedCommission = 0;
  var netWrittenPremium = 0;
  var netEarnedPremium = 0;
  var netWrittenCommission = 0;
  var netEarnedCommission = 0;

  var aggrValues ={};

  var aggrGrossWrittenPremium = 0;
  var aggrGrossEarnedPremium = 0;
  var aggrGrossWrittenCommission = 0;
  var aggrGrossEarnedCommission = 0;
  var aggrNetWrittenPremium = 0;
  var aggrNetEarnedPremium = 0;
  var aggrNetWrittenCommission = 0;
  var aggrNetEarnedCommission = 0;

  if (dataType != "IM") {
    console.log(`The data type "${dataType}" is not valid.`);
    return;
  }
  // --------------------------
  // Update file load register
  // --------------------------
  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  regEntry = new File(regData);
  // Save File Register Entry
  regEntry.save().catch((e) => {
    console.log("---> Register Entry error: ", regEntry);
    result = "400";
    reject(res);
  });
  // --------------------------
  // Sort commission file data
  // --------------------------
  var trxDataSorted = sortByAttribute(trxData, 'productProviderCode', 'fiscalPeriod', 'policyNumber');
  // -----------------------------------------
  // Process data from commission file loaded
  // -----------------------------------------
  for (var i = 0, j = trxCount; i < j; i++) {
    trx = trxDataSorted[i];
    trx.loadFile_id = hexId;
    // ------------------------------------------
    // Replace string values with numeric values
    // ------------------------------------------
    // Get current transaction values and convert
    // Values in the IM data contains spaces remove this also
    grossWrittenPremium = (typeof trx.grossWrittenPremium === 'undefined' || trx.grossWrittenPremium === '-') ? (0) : (Number(trx.grossWrittenPremium.replace(/\s/g,'')));

    grossEarnedPremium = (typeof trx.grossEarnedPremium === 'undefined' || trx.grossEarnedPremium === '-') ? (0) : (Number(trx.grossEarnedPremium.replace(/\s/g,'')));

    grossWrittenCommission = (typeof trx.grossWrittenCommission === 'undefined' || trx.grossWrittenCommission === '-') ? (0) : (Number(trx.grossWrittenCommission.replace(/\s/g,'')));

    grossEarnedCommission = (typeof trx.grossEarnedCommission === 'undefined' || trx.grossEarnedCommission === '-') ? (0) : (Number(trx.grossEarnedCommission.replace(/\s/g,'')));

    netWrittenPremium =  (typeof trx.netWrittenPremium === 'undefined' || trx.netWrittenPremium === '-') ? (0) : (Number(trx.netWrittenPremium.replace(/\s/g,'')));

    netEarnedPremium =  (typeof trx.netEarnedPremium === 'undefined' || trx.netEarnedPremium === '-') ? (0) : (Number(trx.netEarnedPremium.replace(/\s/g,'')));

    netWrittenCommission =  (typeof trx.netWrittenCommission === 'undefined' || trx.netWrittenCommission === '-') ? (0) : (Number(trx.netWrittenCommission.replace(/\s/g,'')));

    netEarnedCommission =  (typeof trx.netEarnedCommission === 'undefined' || trx.netEarnedCommission === '-') ? (0) : (Number(trx.netEarnedCommission.replace(/\s/g,'')));

    // Replace current transaction values with converted values
    trx.grossWrittenPremium = grossWrittenPremium;
    trx.grossEarnedPremium = grossEarnedPremium;
    trx.grossWrittenCommission = grossWrittenCommission;
    trx.grossEarnedCommission = grossEarnedCommission;
    trx.netWrittenPremium = netWrittenPremium;
    trx.netEarnedPremium = netEarnedPremium;
    trx.netWrittenCommission = netWrittenCommission;
    trx.netEarnedCommission = netEarnedCommission;
    //
    // Set current record comparison key
    //
    policyNumber = trx.policyNumber;
    finPeriod = trx.fiscalPeriod;
    currKey = providerCode+finPeriod+policyNumber;
    //
    // Set dummy previous record key for first iteration
    //
    if (i == 0) {
      prevKey = "providerCode"+"999999"+"policyNumber";
      var x = 0;
    }

    console.log("----> Current Key: ", currKey);
    console.log("----> Previous Key: ", prevKey);

    if (currKey != prevKey) {
      // -----------------------------------------------------
      // New doc - get current aggregation values from DB doc
      // -----------------------------------------------------
      try {
        aggrValues = await getAggregation(providerCode, finPeriod, policyNumber);
        // console.log("----> Aggregation values returned: ", aggrValues);

        // Values retrieved from DB
        aggrGrossWrittenPremium = aggrValues.imData.aggrGrossWrittenPremium;
        aggrGrossEarnedPremium = aggrValues.imData.aggrGrossEarnedPremium;
        aggrGrossWrittenCommission = aggrValues.imData.aggrGrossWrittenCommission;
        aggrGrossEarnedCommission = aggrValues.imData.aggrGrossEarnedCommission;
        aggrNetWrittenPremium = aggrValues.imData.aggrNetWrittenPremium;
        aggrNetEarnedPremium = aggrValues.imData.aggrNetEarnedPremium;
        aggrNetWrittenCommission = aggrValues.imData.aggrNetWrittenCommission;
        aggrNetEarnedCommission = aggrValues.imData.aggrNetEarnedCommission;

      }
      catch(error) {
        console.log("----> Aggregation failed for: ", providerCode, finPeriod, policyNumber);
        result = "400";
      }
      // -----------------------------------------------------------
      // Add current transaction values to values retrieved from DB
      // -----------------------------------------------------------
      // console.log("<<<2>>> Before aggregation - DB Value:", aggrGrossEarnedCommission);
      // console.log("<<<2>>> Before aggregation - TRX Value:", grossEarnedCommission);
      aggrGrossWrittenPremium = aggrGrossWrittenPremium + grossWrittenPremium;
      aggrGrossEarnedPremium = aggrGrossEarnedPremium + grossEarnedPremium;
      aggrGrossWrittenCommission = aggrGrossWrittenCommission + grossWrittenCommission;
      aggrGrossEarnedCommission = aggrGrossEarnedCommission + grossEarnedCommission;
      aggrNetWrittenPremium = aggrNetWrittenPremium + netWrittenPremium;
      aggrNetEarnedPremium = aggrNetEarnedPremium + netEarnedPremium;
      aggrNetWrittenCommission = aggrNetWrittenCommission + netWrittenCommission;
      aggrNetEarnedCommission = aggrNetEarnedCommission + netEarnedCommission;
      // console.log("<<<2>>> After aggregation, final result:", aggrGrossEarnedCommission);
      // ----------------------------------------------------------------
      // Start building data object for for DB update from file data rows
      // ----------------------------------------------------------------
      x = x + 1;
      // console.log(">>>----> Create new recon: ", i, x-1, currKey);
      reconData[x-1] = {
        providerCode : providerCode,
        finPeriod : finPeriod,
        policyNumber : policyNumber,
        imData : {
          aggrGrossWrittenPremium : aggrGrossWrittenPremium,
          aggrGrossEarnedPremium : aggrGrossEarnedPremium,
          aggrGrossWrittenCommission : aggrGrossWrittenCommission,
          aggrGrossEarnedCommission : aggrGrossEarnedCommission,
          aggrNetWrittenPremium : aggrNetWrittenPremium,
          aggrNetEarnedPremium : aggrNetEarnedPremium,
          aggrNetWrittenCommission : aggrNetWrittenCommission,
          aggrNetEarnedCommission : aggrNetEarnedCommission,
          imTransactions : []
        }
      }
      // Insert transactions
      reconData[x-1].imData.imTransactions.push(trx);
      console.log("----> New Recon Added: ", i, x-1, currKey);
    }
    else {
      // --------------------------------------------------------------
      // Not a new doc - add row data from file to current data object
      // --------------------------------------------------------------
      // console.log(">>>---> Add trx data to recon: ", x-1, currKey);

      // Update aggregation values
      // console.log("<<<3>>> Before not new doc aggregation - Recon Data Value :", reconData[x-1].imData.aggrGrossEarnedCommission);
      // console.log("<<<3>>> Before not new doc aggregation - TRX Value :", grossEarnedCommission);
      reconData[x-1].imData.aggrGrossWrittenPremium = reconData[x-1].imData.aggrGrossWrittenPremium + grossWrittenPremium;
      reconData[x-1].imData.aggrGrossEarnedPremium = reconData[x-1].imData.aggrGrossEarnedPremium + grossEarnedPremium;
      reconData[x-1].imData.aggrGrossWrittenCommission = reconData[x-1].imData.aggrGrossWrittenCommission + grossWrittenCommission;
      reconData[x-1].imData.aggrGrossEarnedCommission = reconData[x-1].imData.aggrGrossEarnedCommission + grossEarnedCommission;
      reconData[x-1].imData.aggrNetWrittenPremium = reconData[x-1].imData.aggrNetWrittenPremium + netWrittenPremium;
      reconData[x-1].imData.aggrNetEarnedPremium = reconData[x-1].imData.aggrNetEarnedPremium + netEarnedPremium;
      reconData[x-1].imData.aggrNetWrittenCommission = reconData[x-1].imData.aggrNetWrittenCommission + netWrittenCommission;
      reconData[x-1].imData.aggrNetEarnedCommission = reconData[x-1].imData.aggrNetEarnedCommission + netEarnedCommission;
      // console.log("<<<3>>> After not new doc aggregation: ", reconData[x-1].imData.aggrGrossEarnedCommission);

      // add transaction to current transactions
      reconData[x-1].imData.imTransactions.push(trx);

      console.log("----> Recon updated: ", i, x-1, currKey);

    }
    // console.log("----> Recon - IM Data: ", reconData[x-1].imData);
    // console.log(`>>>---> Converted Data:
    //   ${aggrGrossWrittenPremium}, ${aggrGrossEarnedPremium}, ${aggrGrossWrittenCommission}, ${aggrGrossEarnedCommission}, ${aggrNetWrittenPremium}, ${aggrNetEarnedPremium}, ${aggrNetWrittenCommission}, ${aggrNetEarnedCommission}`
    // );
    prevKey = providerCode+finPeriod+policyNumber;

  } // end of processing loop - update data objects created

  // ----------------------
  // Commit processed data
  // ----------------------
  console.log("----> Start Data CommitRecon Process");
  // Create components for Update command
  var committed;
  var reconDoc = {};
  var docCount = reconData.length;
  var setData = {};
  var pushData = [];
  console.log("----> Commit Q length: ", docCount);
  for (var i = 0, j = docCount; i < j; i++) {
    console.log("----> Commit Count: ", i);
    reconDoc = reconData[i];

    // console.log("----> Recon Doc IM data: ", reconDoc);
    finPeriod = reconDoc.finPeriod;
    policyNumber = reconDoc.policyNumber;
    setData = {
      imData : {
        aggrGrossWrittenPremium : reconDoc.imData.aggrGrossWrittenPremium,
        aggrGrossEarnedPremium : reconDoc.imData.aggrGrossEarnedPremium,
        aggrGrossWrittenCommission : reconDoc.imData.aggrGrossWrittenCommission,
        aggrGrossEarnedCommission : reconDoc.imData.aggrGrossEarnedCommission,
        aggrNetWrittenPremium : reconDoc.imData.aggrNetWrittenPremium,
        aggrNetEarnedPremium : reconDoc.imData.aggrNetEarnedPremium,
        aggrNetWrittenCommission : reconDoc.imData.aggrNetWrittenCommission,
        aggrNetEarnedCommission : reconDoc.imData.aggrNetEarnedCommission,
        // Add transaction data place holder
        imTransactions : []
      }
    };
    pushData = {
      "imData.imTransactions": {"$each": reconDoc.imData.imTransactions}
    };

    // console.log(`----> Commit Data Blocks -
    //   Provider Code: ${providerCode},
    //   Period: ${finPeriod},
    //   Policy: ${policyNumber},
    //   Set Data: ${setData},
    //   Push Data: ${pushData}`
    // );

    // Commit document
    try {
      console.log("----> Wait for commit: ", providerCode, finPeriod, policyNumber);
      committed = await docCommit(providerCode, finPeriod, policyNumber, setData, pushData);
      // console.log("----> Save result: ", committed);
      if (!committed) {
        console.log("----> commit failed: ", providerCode, finPeriod, policyNumber);
        result = "400";
      }
      else {
        console.log("----> commit success: ", providerCode, finPeriod, policyNumber);
      }
    }
    catch(err) {
      console.log("----> commit error: ", err.message);
      result = "400";
    }
  } // end of write to DB loop
  // ----
  // Done
  // ----
  return result;
} // end of processFileData function

module.exports = {processMIDataFile};
