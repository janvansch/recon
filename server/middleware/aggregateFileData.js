const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');

// aggregate/reaggregate transaction data for recon docs updated.
function aggregateComTrx(providerCode, finPeriod, policyNumber}) {
  db.recons.aggregate(
    [
      {
        $match: {
          $and: [
            {'$comData.providerCode': providerCode},
            {'$comData.finPeriod': finPeriod},
            {'$comData.policyNumber': policyNumber}
          ]
        }
      }
      {
        $group: {
          _id: { '$comData.providerCode': providerCode,'$comData.finPeriod': finPeriod, '$comData.policyNumber': policyNumber },
          aggrCommAmount: {$sum: "$comData.comTransactions.commissionAmount"},
          aggrVatAmount: {$sum: "$comData.comTransactions.vatAmount"},
          aggrBrokerFeeAmount: {$sum: "$comData.comTransactions.brokerFeeAmount"},
          aggrMonthCommissionAmount: {$sum: "$comData.comTransactions.monthCommissionAmount"},
          aggrPremiumAmount: {$sum: "$comData.comTransactions.premiumAmount"}
        }
      },
      {
        $project: {
          _id: 0,
          aggrCommAmount: 1,
          aggrVatAmount: 1,
          aggrBrokerFeeAmount: 1,
          aggrMonthCommissionAmount: 1,
          aggrPremiumAmount: 1
        }
      },
      { $out: "recon" }
    ],
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    };
  );
  callback(err, result);
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

    //
    // For every transaction recalculate the aggregated totals
    //
  for (var i = 0, j = docCount; i < j; i++) {
      trxEntry = trxData[i];
      policyNumber = trxEntry.policyNumber;
      finPeriod = trxEntry.fiscalPeriod;
    if (dataType == "COM") {
      aggregateComTrx(providerCode, finPeriod, policyNumber, (err, result) => {
        if (err) {
          console.log("---> Aggregation failed", providerCode, finPeriod, policyNumber);
        }
        else {
          console.log("---> Aggregation passed", providerCode, finPeriod, policyNumber);
        }
      });
    }
    else if (type == "IM") {
      aggregateImTrx(providerCode, finPeriod, policyNumber, (err, result) => {
        if (err) {
          console.log("---> Aggregation failed", providerCode, finPeriod, policyNumber);
        }
        else {
          console.log("---> Aggregation passed", providerCode, finPeriod, policyNumber);
        }
      });
    }
  }
  callback( err, result);
};

module.exports = {aggregateFileData};
