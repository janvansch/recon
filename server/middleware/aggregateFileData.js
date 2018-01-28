const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');

// aggregate/reaggregate transaction data for recon docs updated.
function aggregateComTrx(providerCode, finPeriod, policyNumber, callback) {
  console.log("Aggregate match key: ", providerCode, finPeriod, policyNumber);
  Recon.aggregate([
    {
      "$match": {
        "$and": [
          {"providerCode": "providerCode"},
          {"finPeriod": "finPeriod"},
          {"policyNumber": "policyNumber"}
        ]
      }
    },
    {
      "$project": {
        "_id": 0,
        "commissionAmount": "$comData.comTransactions.commissionAmount",
        "vatAmount": "$comData.comTransactions.vatAmount",
        "brokerFeeAmount": "$comData.comTransactions.brokerFeeAmount",
        "monthCommissionAmount": "$comData.comTransactions.monthCommissionAmount",
        "premiumAmount": "$comData.comTransactions.premiumAmount"
      }
    },
    {
      "$group": {
        "_id": {
          "providerCode": "$providerCode",
          "finPeriod": "$finPeriod",
          "policyNumber": "$policyNumber"
        },
        "aggrCommAmount": {"$sum": "$commissionAmount"},
        "aggrVatAmount": {"$sum": "$vatAmount"},
        "aggrBrokerFeeAmount": {"$sum": "$brokerFeeAmount"},
        "aggrMonthCommissionAmount": {"$sum": "$monthCommissionAmount"},
        "aggrPremiumAmount": {"$sum": "$premiumAmount"},
        "trxCount": {"$sum": 1}
      }
    },
    {
      "$project": {
        "_id": 0,
        "aggrCommAmount": 1,
        "aggrVatAmount": 1,
        "aggrBrokerFeeAmount": 1,
        "aggrMonthCommissionAmount": 1,
        "aggrPremiumAmount": 1,
        "trxCount": 1
      }
    }
  ],
    function (err, result) {
        if (err) {
            console.log("===> Aggregation error: ", err);
            callback(err, result);
        }
        console.log("===> Aggregation function result: ", result);
        callback(err, result);
    }
  );
}

function aggregateImTrx() {
  this.imData.aggrGrossWrittenPremium = 0;
  this.imData.aggrGrossEarnedPremium = 0;
  this.imData.aggrGrossWtittenCommission = 0;
  this.imData.aggrGrossEarnedCommission = 0;
  this.imData.aggrNetWrittenPremium = 0;
  this.imData.aggrNetEarnedPremium = 0;
  this.imData.aggrNetWrittenCommission = 0;
  this.imData.aggrNetEarnedCommission = 0;
}

// save data loaded
var aggregateFileData = (fileData, callback) => {
  var dataType = fileData.reg.dataType;
  var providerCode = fileData.reg.providerCode;
  var trxData = fileData.trx.data; // an array of transactions
  var docCount = trxData.length;

  var policyNumber;
  var trxEntry;
  var finPeriod;

  //
  // For every transaction recalculate the aggregated totals
  //
  for (var i = 0, j = docCount; i < j; i++) {
    trxEntry = trxData[i];
    policyNumber = trxEntry.policyNumber;
    finPeriod = trxEntry.fiscalPeriod;
    if (dataType == "COM") {
      aggregateComTrx(providerCode, finPeriod, policyNumber, (err, result) => {
        console.log("---> Com Trx aggregation result", err, result);
        if (err) {
          console.log("---> Com Trx aggregation failed", providerCode, finPeriod, policyNumber);
        }
        else {
          console.log("---> Com Trx aggregation passed", providerCode, finPeriod, policyNumber);
        }
      });
    }
    else if (type == "IM") {
      aggregateImTrx(providerCode, finPeriod, policyNumber, (err, result) => {
        if (err) {
          console.log("---> Im Trx Aggregation failed", providerCode, finPeriod, policyNumber);
        }
        else {
          console.log("---> Im Trx Aggregation passed", providerCode, finPeriod, policyNumber);
        }
      });
    }
  }
  var err = "xxx";
  callback( err, result);
};

module.exports = {aggregateFileData};
