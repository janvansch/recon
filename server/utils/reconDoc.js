var ReconDoc = function (providerCode, finPeriod, policyNumber) {

  this.providerCode = providerCode;
  this.finPeriod = finPeriod;
  this.policyNumber = policyNumber;
  //this.comments = [{}];
  this.comments = [];
  this.comData = {};
  this.comData.aggrCommAmount = 0;
  this.comData.aggrVatAmount = 0;
  this.comData.aggrBrokerFeeAmount = 0;
  this.comData.aggrMonthCommissionAmount = 0;
  this.comData.aggrPremiumAmount = 0;
  this.comData.comTransactions = [];
  this.imData = {};
  this.imData.aggrGrossWrittenPremium = 0;
  this.imData.aggrGrossEarnedPremium = 0;
  this.imData.aggrGrossWtittenCommission = 0;
  this.imData.aggrGrossEarnedCommission = 0;
  this.imData.aggrNetWrittenPremium = 0;
  this.imData.aggrNetEarnedPremium = 0;
  this.imData.aggrNetWrittenCommission = 0;
  this.imData.aggrNetEarnedCommission = 0;
  this.imData.imTransactions = [];

};

module.exports = {ReconDoc};
