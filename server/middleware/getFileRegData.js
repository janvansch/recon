'use strict';

const {ObjectID} = require('mongodb');
//const bodyParser = require('body-parser');
//const {url} = require('url');
//const {querystring} = require('querystring');

const {File} = require('../models/file');

// var getFileRegData = function (request, callback) {
var getFileRegData = (request, callback) => {
    console.log("---> Request query: ", request.query);
    console.log("---> Request url: ", request.url);
    //
    // Extract Filter - All, Default or Specified
    //
    var filter = (typeof request.query['filter'] === 'undefined') ? (0) : (request.query['filter']);
    //var filter = querystring.parse(url.parse(request.url).query).filter;
    console.log("---> Filter: ", filter);
    if (filter == 1) {
      //
      // All data view selected, extract all file register data
      //
      query = {};
    }
    else {
      //
      // Filter specified
      //
      if (filter == 2) {
        // User specified view selected, read filter parameters
        var fromYear = request.query['fromYear'] //querystring.parse(url.parse(request.url).query).fromYear;
        var toYear = request.query['toYear'] //querystring.parse(url.parse(request.url).query).toYear;
        var fromPeriod = request.query['fromPeriod'] //querystring.parse(url.parse(request.url).query).fromPeriod;
        var toPeriod = request.query['toPeriod'] //querystring.parse(url.parse(request.url).query).toPeriod;
      }
      else {
        //
        // Default view selected
        //
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();
        var fromYr = currentYear;
        var toYr = currentYear;
        var fromMonth = currentMonth - 1;
        if (fromMonth < 1) {
            fromMonth = 12 - fromMonth;
            fromYr = fromYr - 1;
        }
        var toMonth = currentMonth + 1;
        if (toMonth > 12) {
            toMonth = toMonth - 12;
            toYr = toYr + 1;
        }
        var fromYear = fromYr.toString();
        var toYear = toYr.toString();
        if (fromMonth < 10) {
          var fromPeriod = "0" + fromMonth.toString();
        }
        else {
          var fromPeriod = fromMonth.toString();
        }
        if (toMonth < 10) {
          var toPeriod = "0" + toMonth.toString();
        }
        else {
          var toPeriod = toMonth.toString();
        }
      }
      var fromProcessPeriod = fromYear + fromPeriod;
      var toProcessPeriod = toYear + toPeriod;
      var fromProcPer = Number(fromProcessPeriod);
      var toProcPer = Number(toProcessPeriod);
      console.log("Filter & Query Params: ", filter, fromProcPer, toProcPer);
      var query = {"processPeriod" : {$gte:fromProcPer, $lte:toProcPer}};
      console.log("Query: ", query);
    }
    //
    // Use Query to extract file register data
    //
    // ================================================
    File.find(
      query,
      {
        _id : 1,
        "providerCode" : 1,
        "dataType" : 1,
        "filename" : 1,
        "processPeriod" : 1,
        "timestamp" : 1,
        "docCount" : 1
      }
    )
    .then((file) => {
      if (file[0] === null) {
        console.log(">>>---> Register empty", file);
        // No document found, create empty doc for display
        var fileList = [
          {
            _id : "-",
            providerCode : "-",
            dataType : "-",
            filename : "-",
            processPeriod : 190001,
            timestamp : "-",
            docCount : "-"
          },
          {
            _id : "-",
            providerCode : "-",
            dataType : "-",
            filename : "-",
            processPeriod : 190001,
            timestamp : "-",
            docCount : "-"
          }
        ];
      }
      else {
        var fileList = file;
      }
      console.log(">>>---> Register content: ", fileList);
      callback(fileList);
    })
    .catch((e) => {
      console.log("====> ERROR: Find failed");
      reject(`Error - Find failed ${e}`);
    });
    // ============================================
    // var fileList = [
    //   {
    //     providerCode : "TST",
    //     dataType : "COM",
    //     filename : "Test",
    //     processPeriod : "201802",
    //     timestamp : "20180131",
    //     docCount : 60
    //   },
    //   {
    //     providerCode : "TXT",
    //     dataType : "IM",
    //     filename : "Test",
    //     processPeriod : "201802",
    //     timestamp : "20180131",
    //     docCount : 600
    //   }
    // ];
    // callback(fileList);
    // =================================================
}

module.exports = {getFileRegData};
