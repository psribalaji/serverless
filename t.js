const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient();
const ses = new aws.SES();
aws.config.update({ region: "us-east-1" });
// const uuid = require("uuid/v4");

exports.handler = (event, context, callback) => {
  console.log("Executing lambda function......");
  //let message = JSON.parse(event.Records[0].Sns.Message);
  
  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

console.log("Querying for movies from 1985.");

let queryParams = {
  TableName: 'dynamo',
  Key: {
      "id": { "S": event.Records[0].Sns.Message }
  },
};
// first get item and check if email exists
//if does not exist put item and send email,
//if exists check if ttl > currentTime,
// if ttl is greater than current time do nothing,
// else send email
ddb.getItem(queryParams, (err, data) => {
  if (err) 
     logger.info("err", err)
  else {
      logger.info("****",data.Item)
      // var d = data.Item.token
      // d = d.split(":")
      logger.info("Tokennnnsss",data.Item.token);
      logger.info("typeof " , typeof(data.Item.token));
      logger.info("sds :", Object.values(data.Item.token)[0]);

      var t = Object.values(data.Item.token)[0]
    //    if(token === t){
    //     logger.info("Verification Success");
    //     User.updateStatus(email,(err1, newValue) =>{
          
    //       console.log("err 1", err1)
    //       if(err1){
    //         logger.error("Verification Failed");

    //         res.status(403).send({
    //           message : "Verification failed"
    //         })

    //       }else{
    //         logger.info("Verification Success");

    //         return res.status(200).send("Successfully Verified")
            
    //       }

    //     })

    //    }else{
    //     return res.status(400).send("Token invalid")
    //    }
   }
  
});

  var params = {
  Destination: { /* required */
    
    ToAddresses: [
      event.Records[0].Sns.Message,
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: "http://prod.csye6225.me/v1/verifyUserEmail?"+event.Records[0].Sns.Message+"&token="+t
      },
      Text: {
       Charset: "UTF-8",
       Data: "TEXT_FORMAT_BODY"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Test email'
     }
    },
  Source: 'no-reply@prod.csye6225.me', /* required */
 
};

// Create the promise and SES service object
var sendPromise = new aws.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    console.log(data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
  
  // var searchParams = {
  //   TableName: "dynamo",
  //   Key: {
  //     id: message.to
  //   }
  // };
  console.log("Checking if record already present in db");
  /* first we get the item from dynamo and check if email exists
    if does not exist put the item and send an email,
    */

};