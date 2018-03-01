"use strict";

const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');
const {sortByAttribute} = require('../utils/sortByAttribute');

// ===================
//  Update Recon Data
// ===================
function docCommit(providerCode, finPeriod, policyNumber, setData, pushData) {
  // workaround for Mongoose problem -
  // can't $set and $push together in one findOneAndUpdate
  // extract aggregation data from $set data and execute individually
  var aggrCommAmount = setData.comData.aggrCommAmount;
  var aggrVatAmount = setData.comData.aggrVatAmount;
  var aggrBrokerFeeAmount = setData.comData.aggrBrokerFeeAmount;
  var aggrMonthCommissionAmount = setData.comData.aggrMonthCommissionAmount;
  var aggrPremiumAmount = setData.comData.aggrPremiumAmount;

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
        'comData.aggrCommAmount' : aggrCommAmount,
        'comData.aggrVatAmount' : aggrVatAmount,
        'comData.aggrBrokerFeeAmount' : aggrBrokerFeeAmount,
        'comData.aggrMonthCommissionAmount' : aggrMonthCommissionAmount,
        'comData.aggrPremiumAmount' : aggrPremiumAmount,

        $push: pushData
      },
      {
        upsert: true,
        new: true
      },
      (err, numAffected, raw) => {
        if (err) {
          console.log(">>>---> TRX save error: ", err );
          var err = true;
          var result = "";
          reject(err);
        }
        else {
          // console.log(`err: ${err},
          //   numAffected: ${numAffected.comData},
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
// =====================================
// Get aggregation value from DB if any
// =====================================
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
        "comData.aggrCommAmount" : 1,
        "comData.aggrVatAmount": 1,
        "comData.aggrBrokerFeeAmount": 1,
        "comData.aggrMonthCommissionAmount": 1,
        "comData.aggrPremiumAmount": 1
      }
    )
    .then((recon) => {
      if (recon[0] == null) {
        console.log(">>>---> Path A - Com aggregation: Document not found");
        // No document found, create template for processing
        reconData = {
          providerCode : providerCode,
          finperiod : finPeriod,
          policyNumber : policyNumber,
          comData : {
            aggrCommAmount : 0,
            aggrVatAmount : 0,
            aggrBrokerFeeAmount : 0,
            aggrMonthCommissionAmount : 0,
            aggrPremiumAmount : 0,
            comTransactions : []
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
          reject("Error - more than one document returned");
        }

        // A document with the search key exists but if it does not
        // contain the relevant aggregation fields, create and assign 0.
        var aggrCommAmount = (typeof recon[0].comData.aggrCommAmount === 'undefined') ? (0) : (recon[0].comData.aggrCommAmount);

        var aggrVatAmount = (typeof recon[0].comData.aggrVatAmount === 'undefined') ? (0) : (recon[0].comData.aggrVatAmount);

        var aggrBrokerFeeAmount = (typeof recon[0].comData.aggrBrokerFeeAmount === 'undefined') ? (0) : (recon[0].comData.aggrBrokerFeeAmount);

        var aggrMonthCommissionAmount = (typeof recon[0].comData.aggrMonthCommissionAmount === 'undefined') ? (0) : (recon[0].comData.aggrMonthCommissionAmount);

        var aggrPremiumAmount = (typeof recon[0].comData.aggrPremiumAmount === 'undefined') ? (0) : (recon[0].comData.aggrPremiumAmount);

        // create document object to be return
        reconData = {
          providerCode : providerCode,
          finperiod : finPeriod,
          policyNumber : policyNumber,
          comData : {
            aggrCommAmount : aggrCommAmount,
            aggrVatAmount : aggrVatAmount,
            aggrBrokerFeeAmount : aggrBrokerFeeAmount,
            aggrMonthCommissionAmount : aggrMonthCommissionAmount,
            aggrPremiumAmount : aggrPremiumAmount,
            comTransactions : []
          }
        }
        //console.log(`====> Aggregation data object:
        //  ${reconData[0].imData}
        // `);
        resolve(reconData);
      }
    })
    .catch((e) => {
      console.log("====> ERROR: Find failed");
      reject(`Error - Find failed ${e}`);
    });
  });
}
// ==========================
//  Process file data loaded
// ==========================
var processComDataFile = async (fileData) => {

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
  var commissionAmount = 0;
  var vatAmount = 0;
  var brokerFeeAmount = 0;
  var monthCommissionAmount = 0;
  var premiumAmount = 0;
  var aggrValues ={};
  var aggrCommAmount = 0;
  var aggrVatAmount = 0;
  var aggrBrokerFeeAmount = 0;
  var aggrMonthCommissionAmount = 0;
  var aggrPremiumAmount = 0;

  if (dataType != "COM") {
    console.log(`The data type "${dataType}" is not valid.`);
    return;
  }
  // --------------------------
  // Update file load register
  // --------------------------
  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  console.log("---> Register document data: ", regData);
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
    // get current transaction values and convert
    commissionAmount = Number(trx.commissionAmount);
    vatAmount = Number(trx.vatAmount);
    brokerFeeAmount = Number(trx.brokerFeeAmount);
    monthCommissionAmount = Number(trx.monthCommissionAmount);
    premiumAmount = Number(trx.premiumAmount);

    // Replace current transaction values with converted values
    trx.commissionAmount = commissionAmount;
    trx.vatAmount = vatAmount;
    trx.brokerFeeAmount = brokerFeeAmount;
    trx.monthCommissionAmount = monthCommissionAmount;
    trx.premiumAmount = premiumAmount;
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
        aggrCommAmount = aggrValues.comData.aggrCommAmount;
        aggrVatAmount = aggrValues.comData.aggrVatAmount;
        aggrBrokerFeeAmount = aggrValues.comData.aggrBrokerFeeAmount;
        aggrMonthCommissionAmount = aggrValues.comData.aggrMonthCommissionAmount;
        aggrPremiumAmount = aggrValues.comData.aggrPremiumAmount;
      }
      catch(error) {
        console.log("----> Aggregation failed for: ", providerCode, finPeriod, policyNumber);
        result = "400";
      }
      // -----------------------------------------------------------
      // Add current transaction values to values retrieved from DB
      // -----------------------------------------------------------
      aggrCommAmount = commissionAmount + aggrCommAmount;
      aggrVatAmount = vatAmount + aggrVatAmount;
      aggrBrokerFeeAmount = brokerFeeAmount + aggrBrokerFeeAmount;
      aggrMonthCommissionAmount = monthCommissionAmount + aggrMonthCommissionAmount;
      aggrPremiumAmount = premiumAmount + aggrPremiumAmount;
      // ----------------------------------------------------------------
      // Start building data object for for DB update from file data rows
      // ----------------------------------------------------------------
      x = x + 1;
      // console.log(">>>----> Create new recon: ", i, x-1, currKey);
      reconData[x-1] = {
        // Add key values
        providerCode : providerCode,
        finPeriod : finPeriod,
        policyNumber : policyNumber,
        comData : {
          // Add aggregation values
          aggrCommAmount : aggrCommAmount,
          aggrVatAmount : aggrVatAmount,
          aggrBrokerFeeAmount : aggrBrokerFeeAmount,
          aggrMonthCommissionAmount : aggrMonthCommissionAmount,
          aggrPremiumAmount : aggrPremiumAmount,
          // Add transaction data place holder
          comTransactions : []
        }
      }
      // Insert transactions
      reconData[x-1].comData.comTransactions.push(trx);

      console.log("----> New Recon Added: ", i, x-1, currKey);
    }
    else {
      // --------------------------------------------------------------
      // Not a new doc - add row data from file to current data object
      // --------------------------------------------------------------
      // console.log(">>>---> Add trx data to recon: ", x-1, currKey);

      // update aggregation values
      reconData[x-1].comData.aggrCommAmount = reconData[x-1].comData.aggrCommAmount + commissionAmount;
      reconData[x-1].comData.aggrVatAmount = reconData[x-1].comData.aggrVatAmount + vatAmount;
      reconData[x-1].comData.aggrBrokerFeeAmount = reconData[x-1].comData.aggrBrokerFeeAmount + brokerFeeAmount;
      reconData[x-1].comData.aggrMonthCommissionAmount = reconData[x-1].comData.aggrMonthCommissionAmount + monthCommissionAmount;
      reconData[x-1].comData.aggrPremiumAmount = reconData[x-1].comData.aggrPremiumAmount + premiumAmount;

      // add transaction to current transactions
      reconData[x-1].comData.comTransactions.push(trx);

      console.log("----> Recon updated: ", i, x-1, currKey);

    }
    // console.log("----> Recon Commission Data: ", reconData[x-1].comData);
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
    console.log("----> Recon Doc: ", reconDoc);
    finPeriod = reconDoc.finPeriod;
    policyNumber = reconDoc.policyNumber;
    setData = {
      comData : {
        aggrCommAmount : reconDoc.comData.aggrCommAmount,
        aggrVatAmount : reconDoc.comData.aggrVatAmount,
        aggrBrokerFeeAmount : reconDoc.comData.aggrBrokerFeeAmount,
        aggrMonthCommissionAmount : reconDoc.comData.aggrMonthCommissionAmount,
        aggrPremiumAmount : reconDoc.comData.aggrPremiumAmount,
        // Add transaction data place holder
        // comTransactions : []
      }
    };
    pushData = {
      "comData.comTransactions": {"$each": reconDoc.comData.comTransactions}
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

module.exports = {processComDataFile};
