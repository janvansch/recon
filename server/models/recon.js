var mongoose = require('mongoose');

var reconSchema = new mongoose.Schema({
// var reconData = mongoose.model('reconData', {
  providerCode: {
    type: String,
    minlength: 3,
    trim: true
  },
  finPeriod: {
    type: Number
  },
  policyNumber: {
    type: String,
    minlength: 1,
    trim: true
  },
  comments: [{
    text: {
      type: String,
      trim: true
    },
    timestamp: {
      type: String,
      trim: true
    },
    userId: {
      type: String,
      trim: true
    }
  }],
  comData: {
    aggrCommAmount: {
      type: Number
    },
    aggrVatAmount: {
      type: Number
    },
    aggrBrokerFeeAmount: {
      type: Number
    },
    aggrMonthCommissionAmount: {
      type: Number
    },
    aggrPremiumAmount: {
      type: Number
    },
    comTransactions: [{
      productProviderCode: {
        type: Number
      },
      marketersCode: {
        type: Number
      },
      sourceCode: {
        type: Number
      },
      policyNumber: {
        type: String,
        trim: true
      },
      policyHolder: {
        type: String,
        trim: true
      },
      initials: {
        type: String,
        trim: true
      },
      commissionType: {
        type: Number
      },
      commissionAmount: {
        type: Number
      },
      vatAmount: {
        type: Number
      },
      brokerFeeAmount: {
        type: Number
      },
      monthCommissionAmount: {
        type: Number
      },
      revisedPolicyNumber: {
        type: String,
        trim: true
      },
      premiumAmount: {
        type: Number
      },
      lineOfBusiness: {
        type: Number
      },
      branchAgentCode: {
        type: String,
        trim: true
      },
      period: {
        type: Number
      },
      firstReferrer: {
        type: String,
        minlength: 3,
        trim: true
      },
      secondReferrer: {
        type: String,
        minlength: 3,
        trim: true
      },
      thirdReferrer: {
        type: String,
        minlength: 3,
        trim: true
      },
      loadFile_id: {
        type: String
      }
    }]
  },
  imData: {
    aggrGrossWrittenPremium: {
      type: Number
    },
    aggrGrossEarnedPremium: {
      type: Number
    },
    aggrGrossWtittenCommission: {
      type: Number
    },
    aggrGrossEarnedCommission: {
      type: Number
    },
    aggrNetWrittenPremium: {
      type: Number
    },
    aggrNetEarnedPremium: {
      type: Number
    },
    aggrNetWrittenCommission: {
      type: Number
    },
    aggrNetEarnedCommission: {
      type: Number
    },
    imTransactions : [{
      fiscalPeriod: {
        type: Number
      },
      providerCode: {
        type: String,
        minlength: 3,
        trim: true
      },
      providerBrokerCode: {
        type: Number
      },
      stiProviderBrokerCode: {
        type: String,
        minlength: 1,
        trim: true
      },
      policyNumber: {
        type: String,
        trim: true
      },
      stiPolicy: {
        type: String,
        minlength: 1,
        trim: true
      },
      productGroup: {
        type: String,
        trim: true
      },
      productSummary: {
        type: String,
        trim: true
      },
      contractPeriodFrom: {
        type: Date,
      },
      contractPeriodTo: {
        type: Date,
      },
      grossWrittenPremium: {
        type: Number
      },
      grossEarnedPremium: {
        type: Number
      },
      grossWtittenCommission: {
        type: Number
      },
      grossEarnedCommission: {
        type: Number
      },
      netWrittenPremium: {
        type: Number
      },
      netEarnedPremium: {
        type: Number
      },
      netWrittenCommission: {
        type: Number
      },
      netEarnedCommission: {
        type: Number
      },
      loadFile_id: {
        type: String
      }
    }]
  }
});

var Recon = mongoose.model('recon', reconSchema);

module.exports = {Recon};
