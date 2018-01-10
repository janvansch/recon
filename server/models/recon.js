var mongoose = require('mongoose');

var reconSchema = new mongoose.Schema({
// var reconData = mongoose.model('reconData', {
  providerCode: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  period: {
    type: Number,
    required: true
  },
  policyNumber: {
    type: String,
    Required: true,
    minlength: 1
    trim: true
  },
  comments: [{
    text: {
      type: String,
      trim: true
    },
    timestamp: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: String,
      required: true,
      trim: true
    }
  }],
  comData: {
    aggrCommAmount: {
      type: Number,
      required: true
    },
    aggrVatAmount: {
      type: Number,
      required: true
    },
    aggrBrokerFeeAmount: {
      type: Number,
      required: true
    },
    aggrMonthCommissionAmount: {
      type: Number,
      required: true
    },
    aggrPremium_amount: {
      type: Number,
      required: true
    },
    comTransactions: {[
      productProviderCode: {
        type: Number,
        required: true
      },
      marketersCode: {
        type: Number,
        required: true
      },
      agtCode: {
        type: Number,
        required: true
      },
      policyNumber: {
        type: String,
        required: true,
        trim: true
      },
      policyHolder: {
        type: String,
        required: true,
        trim: true
      },
      initials: {
        type: String,
        trim: true
      },
      commType: {
        type: Number,
        required: true
      },
      commissionAmount: {
        type: Number,
        required: true
      },
      vatAmount: {
        type: Number,
        required: true
      },
      brokerFeeAmount: {
        type: Number,
        required: true
      },
      monthCommissionAmount: {
        type: Number,
        required: true
      },
      revised_policy_no: {
        type: String,
        required: true,
        trim: true
      },
      premium_amount: {
        type: Number,
        required: true
      },
      lineOfBusiness: {
        type: Number,
        required: true
      },
      branchAgentCode: {
        type: String,
        required: true,
        trim: true
      },
      period: {
        type: Number,
        required: true
      },
      firstReferrer: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
      },
      secondReferrer: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
      },
      thirdReferrer: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
      }]
      loadFile_id: {
        type: ObjectId,
        required: true
      }
    },
  },
  imData: {
    aggrGrossWrittenPremium: {
      type: Number,
      required: true
    },
    aggrGrossEarnedPremium: {
      type: Number,
      required: true
    },
    aggrGrossWtittenCommission: {
      type: Number,
      required: true
    },
    aggrGrossEarnedCommission: {
      type: Number,
      required: true
    },
    aggrNetWrittenPremium: {
      type: Number,
      required: true
    },
    aggrNetEarnedPremium: {
      type: Number,
      required: true
    },
    aggrNetWrittenCommission: {
      type: Number,
      required: true
    },
    aggrNetEarnedCommission: {
      type: Number,
      required: true
    },
    imTransactions : [{
      fiscalPeriod: {
        type: Number,
        required: true
      },
      providerCode: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
      },
      providerBrokerCode: {
        type: Number,
        required: true
      },
      stiProviderBrokerCode: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
      },
      policyNumber: {
        type: String,
        required: true,
        trim: true
      },
      stiPolicy: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
      },
      productGroup: {
        type: String,
        required: true,
        trim: true
      },
      productSummary: {
        type: String,
        required: true,
        trim: true
      },
      contractPeriodFrom: {
        type: Date,
        required: true,
      },
      contractPeriodTo: {
        type: Date,
        required: true,
      },
      grossWrittenPremium: {
        type: Number,
        required: true
      },
      grossEarnedPremium: {
        type: Number,
        required: true
      },
      grossWtittenCommission: {
        type: Number,
        required: true
      },
      grossEarnedCommission: {
        type: Number,
        required: true
      },
      netWrittenPremium: {
        type: Number,
        required: true
      },
      netEarnedPremium: {
        type: Number,
        required: true
      },
      netWrittenCommission: {
        type: Number,
        required: true
      },
      netEarnedCommission: {
        type: Number,
        required: true
      },
      loadFile_id: {
        type: ObjectId,
        required: true
      }
    }]
  }
});

var recon = mongoose.model('recon', reconSchema);

module.exports = {recon};
