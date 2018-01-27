var Transaction = function (type, providerCode, finPeriod, trxEntry) {

  // this.providerCode = providerCode;
  // this.finPeriod = finPeriod;
  // this.policyNumber = trxEntry.policyNumber;
  // this.comments = [{}];

  console.log("===> TRX Entry: ", trxEntry);

  if (type == "COM") {
    this.comData = {};
    //this.comData.comTransactions = [{}];
    this.comData.comTransactions = trxEntry;

    this.comData.comTransactions.push(trxEntry);

    console.log("===> comTransactions: ", this.comData.comTransactions);
  }
  else if (type == "IM") {
    this.imData = {};
    //this.imData.imTransactions = [{}];
    this.imData.imTransactions = [trxEntry];
  }
};

module.exports = {Transaction};





  this.users.push(user);
