const {ObjectID} = require('mongodb');

const {Recon} = require('../models/recon');
const {File} = require('../models/file');

//const {Transaction} = require('../utils/transaction');
const {ReconDoc} = require('../utils/reconDoc');

// create place holder recon docs
function createReconDoc(reconDoc, callback) {
  var result = false;
  var recon = new Recon(reconDoc);
  // recon.save((err, doc) => {
  //   if (err) {
  //     console.log("===> ERROR - Recon doc create failed: ", err);
  //     result = false;
  //   }
  //   if (!doc) {
  //     console.log("===> Recon Doc create failed: ", doc);
  //     result = false;
  //   }
  //   else {
  //     console.log("===> Recon Doc created: ");
  //     result = true;
  //   }
  //   callback(result);
  // });
  recon.save().then((doc) => {
    console.log("===> Recon Doc created: ");
    return true;
  }, (e) => {
    console.log("===> ERROR - Recon doc create failed: ", e);
    return false;
  });
}

// // check if recon doc already exists
// function docExists(providerCode, finPeriod, policyNumber, trxEntry, callback) {
//   Recon.findOne(
//     {
//       'providerCode': providerCode,
//       'finPeriod': finPeriod,
//       'policyNumber': policyNumber
//     },
//     {"providerCode" : true, "_id" : false},
//     (err, doc) => {
//       var result;
//       if (err) {
//         console.log("findOne returned an error: ", err);
//         result = false;
//       }
//       else if (!doc) {
//         result = false;
//         console.log("===> Found doc: ", result);
//       }
//       else {
//         result = true;
//         console.log("===> Found doc: ", result);
//       }
//       callback(result, providerCode, finPeriod, policyNumber, trxEntry);
//     }
//   );
//
// }



// Add commission transaction to recon doc
function appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, callback) {
  var result;
  // Setup Transaction
  // trxEntry.loadFile_id = hexId;
  // console.log("===> TRX Entry: ", trxEntry);
  //var trxDocument = new Transaction(dataType, providerCode, finPeriod, trxEntry);
  //console.log("===> Transaction Document: ", trxDocument);
  var pushTo = '"comData.comTransactions"';
  // $push Recon Transaction
  Recon.findOneAndUpdate(
    {
      'providerCode': providerCode,
      'finPeriod': finPeriod,
      'policyNumber': policyNumber
    },
    //{$push: {trxDocument}},
    //{$push: {comTransactions: trxEntry}},
    //{ $addToSet: { comTransactions: { $each: 'trxEntry' } } },

    // {$push: {$$pushTo: trxEntry}},
    {$push: {"comData.comTransactions": trxEntry}},
    {
      //upsert: true,
      new: true
    },
    (err, numAffected, raw) => {
      if (err) {
        console.log("TRX save error: ", err );
        var err = true;
        var result = "";
      }
      else {
        // console.log(`err: ${err}, numAffected: ${numAffected}, raw: ${raw}`);
        err = "";
        result = true;
        console.log(`TRX appended result - err: ${err}, result: ${result}`);
    }
      callback(err, result);
    }
  );
}

// check if recon doc already exists
function reconAvailable(providerCode, finPeriod, policyNumber, callback) {
  Recon.findOne({
    'providerCode': providerCode,
    'finPeriod': finPeriod,
    'policyNumber': policyNumber
  })
  .then((recon) => {
    if (!recon) {
      console.log("===> Recon not found, creating one - ", providerCode, finPeriod, policyNumber);
      reconDoc = new ReconDoc(providerCode, finPeriod, policyNumber);
      var recon = new Recon(reconDoc);
      recon.save()
      .then((doc) => {
        console.log("===> Recon Doc created: ");
        callback(true);
      }, (e) => {
        console.log("===> ERROR - Recon doc create failed: ", e);
        callback(false);
      });
    }
    console.log("===> Recon found for - ", providerCode, finPeriod, policyNumber);
    callback(true);
  })
  .catch((e) => {
    console.log("===> Find returned an error: ", e);
    callback(false);
  });
}
  // Recon.findOne(
  //   {
  //     'providerCode': providerCode,
  //     'finPeriod': finPeriod,
  //     'policyNumber': policyNumber
  //   },
  //   {"providerCode" : true, "_id" : false},
  //   (err, doc) => {
  //     var result;
  //     if (err) {
  //       console.log("===> findOne returned an error: ", err);
  //       result = false;
  //     }
  //     else if (!doc) {
  //       result = false
  //       console.log("===> Found doc: ", result, " create one - ", providerCode, finPeriod, policyNumber);
  //       reconDoc = new ReconDoc(providerCode, finPeriod, policyNumber);
  //       var recon = new Recon(reconDoc);
  //       recon.save().then(result = (doc) => {
  //         console.log("===> Recon Doc created: ");
  //         result = true;
  //       }, (e) => {
  //         console.log("===> ERROR - Recon doc create failed: ", e);
  //         result = false;
  //       });
  //     }
  //     else {
  //       result = true;
  //       console.log("===> Found doc: ", result);
  //     }
  //     return result;
  //     //callback(result, providerCode, finPeriod, policyNumber);
  //   }
  // );

function processTrx (dataType, providerCode, finPeriod, policyNumber, trxEntry, callback) {
  reconAvailable(providerCode, finPeriod, policyNumber, (available) => {
    console.log("====> Recon available? ", available);    
    if (available) {
      console.log("===> Recon doc available, processing TRX");
      if (dataType == "COM") {
        appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
          if (!result) {
            console.log("COM TRX append failed", trxEntry);
            result = false;
          }
        });
        console.log("---> COM TRX doc appended");
        result = true;
        callback(result);
      }
      // else if (type == "IM") {
      //   //pushTo = '"imData.imTransactions"';
      //   //console.log("===> pushTo: ", pushTo);
      //   appendImTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
      //     if (!result) {
      //       return console.log("Trx append failed", trxEntry);
      //     }
      //   });
      //   console.log("---> IM TRX doc saved");
      // }
    }
    else{
      console.log("===> Recon doc not available, cannot process TRX");
      var result = false;
      callback(result);
    }
  });
}

// save data loaded
var processFileData = (fileData) => {
  // var fileDataObj = JSON.parse(fileData); // convert JSON text into JS object
  var regData = fileData.reg;
  var trxData = fileData.trx.data; // an array of transactions
  var hexId = new ObjectID().toHexString();
  var userId = "1234567890a";
  var docCount = trxData.length;
  var dataType = regData.dataType;
  var providerCode = regData.providerCode;
  // var loadPeriod = regData.year + regData.period;
  var policyNumber;
  var policyNumber;
  var regEntry;
  var trxEntry;
  var reconDocExist;
  // var trxDocument = {};
  var result;
  var res = "200";

  // console.log("---> File data body: ", fileData);
  // console.log("---> File data reg: ", regData);
  // console.log("---> File data trx: ", trxData);
  console.log("---> Doc Count: ", docCount);

  // Setup File Register Entry
  regData.userId = userId;
  regData._id = hexId;
  regEntry = new File(regData);

  // Save File Register Entry
  regEntry.save().catch((e) => {
    return res = "400";
  });

  // Process file data
  for (var i = 0, j = docCount; i < j; i++) {
    trxEntry = trxData[i];
    policyNumber = trxEntry.policyNumber;
    trxEntry.loadFile_id = hexId;
    finPeriod = trxEntry.fiscalPeriod;

    console.log(`---> Trx number: ${i}, Recon key - Provider: ${providerCode}, Period: ${finPeriod}, Policy: ${policyNumber}.`);

    processTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (success) => {
      if (!success) {
        // console.log("---> Trx process failed", trxEntry);
        console.log("---> Trx process failed", dataType, providerCode, finPeriod, policyNumber);
        return res = "400";
      }
      console.log("---> Trx processed");

    });
  } // End of file data processing loop
  console.log("<---- File data processing complete ----> ");
  return res;
} // end of saveFileData function

module.exports = {processFileData};

// // save data loaded
// var processFileData = (fileData) => {
//   // var fileDataObj = JSON.parse(fileData); // convert JSON text into JS object
//   var regData = fileData.reg;
//   var trxData = fileData.trx.data; // an array of transactions
//   var hexId = new ObjectID().toHexString();
//   var userId = "1234567890a";
//   var docCount = trxData.length;
//   var dataType = regData.dataType;
//   var providerCode = regData.providerCode;
//   // var loadPeriod = regData.year + regData.period;
//   var policyNumber;
//   var policyNumber;
//   var regEntry;
//   var trxEntry;
//   var reconDocExist;
//   // var trxDocument = {};
//   var result;
//
//   // console.log("---> File data body: ", fileData);
//   // console.log("---> File data reg: ", regData);
//   // console.log("---> File data trx: ", trxData);
//   console.log("---> Doc Count: ", docCount);
//
//   // Setup File Register Entry
//   regData.userId = userId;
//   regData._id = hexId;
//   regEntry = new File(regData);
//
//   // Save File Register Entry
//   regEntry.save().catch((e) => {
//     return res = "400";
//   });
//
//   // Process file data
//   for (var i = 0, j = docCount; i < j; i++) {
//     trxEntry = trxData[i];
//     policyNumber = trxEntry.policyNumber;
//     trxEntry.loadFile_id = hexId;
//     finPeriod = trxEntry.fiscalPeriod;
//
//     console.log(`--->  Verify Recon doc number: ${i}, Search key ->  Provider: ${providerCode}, Period: ${finPeriod}, Policy: ${policyNumber}.`);
//     //console.log(`---> Verify Recon doc number: ${i} for policy: ${policyNumber}`);
//
//     // Check if recon doc exists
//     docExists(providerCode, finPeriod, policyNumber, trxEntry, (found, providerCode, finPeriod, policyNumber, trxEntry) => {
//       if (!found) {
//         // No recon doc found, insert new recon doc
//         console.log('---> Recon doc not found, create one', providerCode, finPeriod, policyNumber);
//         reconDoc = new ReconDoc(providerCode, finPeriod, policyNumber);
//         var created = createReconDoc(reconDoc, (result) => {
//           if (!result) {
//             console.log(">>> Error - Recon doc creation failed");
//             return false;
//           }
//           return true;
//         });
//       }
//
//       else if (found || created){
//         console.log("---> Recon doc available");
//         // Append transaction data
//         //console.log(`---> Append to recon doc ${n + 1}: `, trxEntry);
//         //var trxDocument = new Transaction(dataType, providerCode, finPeriod, trxEntry);
//
//         if (dataType == "COM") {
//           //pushTo = '"comData.comTransactions"';
//           //console.log("===> pushTo: ", pushTo);
//           var result = appendComTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
//             if (!result) {
//               console.log("Trx append failed", trxEntry);
//               return false;
//             }
//           });
//           console.log("---> COM TRX doc saved");
//           return true;
//         }
//         else if (type == "IM") {
//           //pushTo = '"imData.imTransactions"';
//           //console.log("===> pushTo: ", pushTo);
//           appendImTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (err, result) => {
//             if (!result) {
//               return console.log("Trx append failed", trxEntry);
//             }
//           });
//           console.log("---> IM TRX doc saved");
//         }
//
//
//       //   appendTrx(dataType, providerCode, finPeriod, policyNumber, trxEntry, (append) => {
//       //     if (!append) {
//       //       console.log("Trx append failed", )
//       //     }
//       //   });
//       //   console.log("---> TRX docs saved");
//       }
//       else {
//         result = false
//       }
//     });
//     //if (!result) {exit}
//   } // End of file data processing loop
//
//   // Recon.findOneAndUpdate(
//   //   {
//   //     'providerCode': providerCode,
//   //     'finPeriod': finPeriod,
//   //     'policyNumber': policyNumber
//   //   },
//   //   //{$push: {trxDocument}},
//   //   //{$push: {"comData.comTransactions": trxEntry}},
//   //   {
//   //     $addToSet: { "comData.comTransactions": { $each: trxData } }
//   //   },
//   //   {
//   //     upsert: true,
//   //     new: true
//   //   },
//   //   (err, numAffected, raw) => {
//   //     console.log(`err: ${err}, numAffected: ${numAffected}, raw: ${raw}`);
//   //     if (err) {
//   //       console.log("---> Save error: ", err );
//   //       result = false;
//   //     }
//   //     result = true;
//   //     // callback(result);
//   //   }
//   // );
//   console.log("<==== end of process file data ====>")
//   return result;
// } // end of saveFileData function
