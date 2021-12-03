const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient();
const ses = new aws.SES();
aws.config.update({ region: "us-east-1" });
// const uuid = require("uuid/v4");

exports.handler = (event, context, callback) => {
  console.log("Executing lambda function......");
  //let message = JSON.parse(event.Records[0].Sns.Message);
  
    var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});
    let t
    let queryParams = {
    TableName: 'dynamo',
      Key: {
          "id": { "S": event.Records[0].Sns.Message }
      },
    };

ddb.getItem(queryParams, (err, data) => {
  if (err) 
     console.log(err)
  else {
     

      t = Object.values(data.Item.token)[0]
      console.log('TT ', t)
    
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
         Data: "http://prod.csye6225.me/v1/verifyUserEmail?email="+event.Records[0].Sns.Message+"&token="+t
        },
        Text: {
         Charset: "UTF-8",
         Data: "TEXT_FORMAT_BODY"
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'Email Verification'
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
 
     }
  
});

 

};