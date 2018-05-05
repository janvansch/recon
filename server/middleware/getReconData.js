'use strict';

const {ObjectID} = require('mongodb');
//const bodyParser = require('body-parser');
//const {url} = require('url');
//const {querystring} = require('querystring');

const {Recon} = require('../models/recon');

//
// Retrieve data for requested recon reportParams
//
var getReconData = (request, callback) => {
    console.log("---> Request: ", request.body);
    console.log("---> Request url: ", request.url);
    var provider = request.body.provider;
    var year = request.body.year;
    var period = request.body.period;
    var finPeriod = Number(year + period);
    console.log("Query Params: ", provider, finPeriod);
    var query = {"providerCode" : provider,"finPeriod" : finPeriod};
    console.log("Query: ", query);
    //
    // Use Query to extract file register data
    //
    Recon.find(
      query,
      {
        _id : 1,
        "providerCode" : 1,
        "finPeriod" : 1,
        "policyNumber" : 1,
        "comData.aggrCommAmount" : 1,
        "comData.aggrVatAmount" : 1,
        "comData.aggrBrokerFeeAmount" : 1,
        "comData.aggrMonthCommissionAmount" : 1,
        "comData.aggrPremiumAmount" : 1,
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
      if (recon[0] === null) {
        console.log(">>>---> Register empty", recon);
        // No document found, create empty doc for display
        var reconData = [
          {
            finPeriod : "-",
            policyNumber : "-",
            providerCode : "-",
            comData : {
              aggrCommAmount : "-",
              aggrVatAmount : "-",
              aggrBrokerFeeAmount : "-",
              aggrMonthCommissionAmount : "-",
              aggrPremiumAmount : "-"
            },
            imData : {
              aggrGrossWrittenPremium : "-",
              aggrGrossEarnedPremium : "-",
              aggrGrossWrittenCommission : "-",
              aggrGrossEarnedCommission : "-",
              aggrNetWrittenPremium : "-",
              aggrNetEarnedPremium : "-",
              aggrNetWrittenCommission : "-",
              aggrNetEarnedCommission : "-"
            }
          }
        ];
      }
      else {
        var reconData = recon;
      }
      console.log(">>>---> Report content: ", reconData);
      callback(reconData);
    })
    .catch((e) => {
      console.log("====> ERROR: Find failed");
      reject(`Error - Find failed ${e}`);
    });
}

module.exports = {getReconData};
