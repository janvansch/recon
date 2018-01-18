var transaction = function (type, providerCode, finPeriod, trxEntry) {

  this.providerCode = providerCode;
  this.finPeriod = finPeriod;
  this.policyNumber = trxEntry.policyNumber;

  if (type == "COM") {
    this.comData = {};
    this.comData.comTransactions = [{}];
    this.comData.comTransactions = trxEntry;
  }
  else if (type == "IM") {
    this.imData = {};
    this.imData.imTransactions = [{}];
    this.imTransactions = trxEntry;
  }
};

module.exports = {transaction};
