"use strict";

const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');
//
// Sort data by attribute
//
function sortByAttribute(array, ...attrs) {
  // Credit: by a8m on stackoverflow
  // generate an array of predicate-objects contains
  // property getter, and descending indicator
  let predicates = attrs.map(pred => {
    let descending = pred.charAt(0) === '-' ? -1 : 1;
    pred = pred.replace(/^-/, '');
    return {
      getter: o => o[pred],
      descend: descending
    };
  });
  // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
  return array.map(item => {
    return {
      src: item,
      compareValues: predicates.map(predicate => predicate.getter(item))
    };
  })
  .sort((o1, o2) => {
    let i = -1, result = 0;
    while (++i < predicates.length) {
      if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
      if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
      if (result *= predicates[i].descend) break;
    }
    return result;
  })
  .map(item => item.src);
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
      if (recon.length > 1 ){
        console.log("====> ERROR: DB Aggr Find result: ", recon.length, recon);
        reject("Error - more than one document returned");
      }

      console.log("====> Aggr recon data: ", recon[0]);

      if (recon[0] == null) {
        console.log(">>>---> Path A - not found");
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
        console.log(">>>---> Path B - found");
        reconData = {
          providerCode : providerCode,
          finperiod : finPeriod,
          policyNumber : policyNumber,
          comData : {
            aggrCommAmount : recon[0].comData.aggrCommAmount,
            aggrVatAmount : recon[0].comData.aggrVatAmount,
            aggrBrokerFeeAmount : recon[0].comData.aggrBrokerFeeAmount,
            aggrMonthCommissionAmount : recon[0].comData.aggrMonthCommissionAmount,
            aggrPremiumAmount : recon[0].comData.aggrPremiumAmount,
            comTransactions : []
          }
        }
        resolve(reconData);
      }
    })
    .catch((e) => {
      console.log("====> ERROR: Find failed");
      reject(`Error - Find failed ${e}`);
    });
  });
}
/**************************
  Process file data loaded
***************************/
var processFileData = async (fileData) => {
  //var test = aggrValues(fileData);
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
  // =========================
  // Update file load register
  // =========================
  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  regEntry = new File(regData);
  // Save File Register Entry
  regEntry.save().catch((e) => {
    console.log("---> Register Entry error: ", regEntry);
    result = "400";
    // return res;
    reject(res);
  });
  // =====================
  // Sort transaction data
  // =====================
  //console.log("====> unsorted: ", trxData);
  var trxDataSorted = sortByAttribute(trxData, 'productProviderCode', 'fiscalPeriod', 'policyNumber');
  // console.log("====> sorted: ", trxDataSorted);
  // ========================================
  // Process data from commission file loaded
  // ========================================
  for (var i = 0, j = trxCount; i < j; i++) {
    trx = trxDataSorted[i];
    trx.loadFile_id = hexId;

    commissionAmount = Number(trx.commissionAmount);
    vatAmount = Number(trx.vatAmount);
    brokerFeeAmount = Number(trx.brokerFeeAmount);
    monthCommissionAmount = Number(trx.monthCommissionAmount);
    premiumAmount = Number(trx.premiumAmount);

    trx.commissionAmount = commissionAmount;
    trx.vatAmount = vatAmount;
    trx.brokerFeeAmount = brokerFeeAmount;
    trx.monthCommissionAmount = monthCommissionAmount;
    trx.premiumAmount = premiumAmount;

    policyNumber = trx.policyNumber;
    finPeriod = trx.fiscalPeriod;
    currKey = providerCode+finPeriod+policyNumber;

    console.log("----> Current Key: ", currKey);

    if (i == 0) {
      prevKey = "providerCode"+"999999"+"policyNumber";
      console.log("----> Previous Key: ", prevKey);
      var x = 0;
    }
    if (currKey != prevKey) {
      try {
        aggrValues = await getAggregation(providerCode, finPeriod, policyNumber);
        console.log("----> Aggregation values returned: ", aggrValues);
        aggrCommAmount = aggrValues.comData.aggrCommAmount;
        aggrVatAmount = aggrValues.comData.aggrVatAmount;
        aggrBrokerFeeAmount = aggrValues.comData.aggrBrokerFeeAmount;
        aggrMonthCommissionAmount = aggrValues.comData.aggrMonthCommissionAmount;
        aggrPremiumAmount = aggrValues.comData.aggrPremiumAmount;
      }
      catch(error) {
        console.log("----> Aggregation failed for: ", providerCode, finPeriod, policyNumber);
      }
      aggrCommAmount = commissionAmount + aggrCommAmount;
      aggrVatAmount = vatAmount + aggrVatAmount;
      aggrBrokerFeeAmount = brokerFeeAmount + aggrBrokerFeeAmount;
      aggrMonthCommissionAmount = monthCommissionAmount + aggrMonthCommissionAmount;
      aggrPremiumAmount = premiumAmount + aggrPremiumAmount;
      var x = x + 1;
      console.log(">>>----> Create new recon: ", i, x-1, currKey);
      reconData[x-1] = {
        providerCode : providerCode,
        finPeriod : finPeriod,
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

      reconData[x-1].comData.comTransactions.push(trx);

      console.log("----> New Recon Added: ", i, x-1, currKey);
    }
    else {
      console.log(">>>---> Add trx data to recon: ", x-1, currKey);

      reconData[x-1].comData.aggrCommAmount = reconData[x-1].comData.aggrCommAmount + commissionAmount;
      reconData[x-1].comData.aggrVatAmount = reconData[x-1].comData.aggrVatAmount + vatAmount;
      reconData[x-1].comData.aggrBrokerFeeAmount = reconData[x-1].comData.aggrBrokerFeeAmount + brokerFeeAmount;
      reconData[x-1].comData.aggrMonthCommissionAmount = reconData[x-1].comData.aggrMonthCommissionAmount + monthCommissionAmount;
      reconData[x-1].comData.aggrPremiumAmount = reconData[x-1].comData.aggrPremiumAmount + premiumAmount;

      reconData[x-1].comData.comTransactions.push(trx);

      console.log("----> Recon updated: ", i, x-1, currKey);
      console.log("----> Recon CommData: ", reconData[x-1].comData);
    }

    prevKey = providerCode+finPeriod+policyNumber;
    console.log("----> Previous Key: ", prevKey);
  } // end of processing loop
  // ===================
  // Save processed data
  // ===================
  Recon.insertMany(reconData, (error, docs) => {
    if (error) {
      console.log("----> ERROR: ", error);
      result = "400"
    }
  });
  return result;

} // end of saveFileData function

module.exports = {processFileData};

// // Add commission transaction to recon doc
// function appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry) {
//   return new Promise((resolve, reject) => {
//     Recon.findOneAndUpdate(
//       {
//         'providerCode': providerCode,
//         'finPeriod': finPeriod,
//         'policyNumber': policyNumber
//       },
//       {
//         'providerCode': providerCode,
//         'finPeriod': finPeriod,
//         'policyNumber': policyNumber,
//         // $set: {"comData": aggrData(providerCode, finPeriod, policyNumber)}
//         // $set: await aggregator( providerCode, finPeriod, policyNumber, trxEntry),
//         //'comData.aggrCommAmount': await aggregator( providerCode, finPeriod, policyNumber, trxEntry),
//         //'comData.aggrCommAmount': ( (recon[0] == null) ? Number(trxEntry.commissionAmount) : recon[0].comData.aggrCommAmount + Number(trxEntry.commissionAmount)),
//         // 'comData.aggrCommAmount': ( (recon[0] == null) ? Number(trxEntry.commissionAmount) : recom[0].comData.aggrCommAmount + Number(trxEntry.commissionAmount)),
//         // 'comData.aggrVatAmount': 0,
//         // 'comData.aggrBrokerFeeAmount': 0,
//         // 'comData.aggrMonthCommissionAmount': 0,
//         // 'comData.aggrPremiumAmount': 0,
//         $push: {"comData.comTransactions": trxEntry}
//       },
//       {
//         upsert: true,
//         new: true
//       },
//       (err, numAffected, raw) => {
//         if (err) {
//           console.log(">>>---> TRX save error: ", err );
//           var err = true;
//           var result = "";
//           reject(err);
//         }
//         else {
//           console.log(`err: ${err}, numAffected: ${numAffected.comData}, raw: ${raw}`);
//           tester( providerCode, finPeriod, policyNumber, trxEntry);
//           err = "";
//           result = true;
//           console.log(`>>>---> TRX save success - Provider Code: ${providerCode}, Period: ${finPeriod} Policy: ${policyNumber}`);
//           resolve(result);
//         }
//       }
//     );
//     // console.log(">>>---> Return: ", recon[0] );
//     // if (!recon[0]) {
//     //   console.log(">>>---> TRX save error: ", recon[0] );
//     //   var result = false;
//     //   reject(result);
//     // }
//     // else {
//     //   // console.log(`err: ${err}, numAffected: ${numAffected}, raw: ${raw}`);
//     //   result = true;
//     //   console.log(`>>>---> TRX save success - Provider Code: ${providerCode}, Period: ${finPeriod} Policy: ${policyNumber}`);
//     //   resolve(result);
//     // }
//   });
// }
