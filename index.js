const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient();
const ses = new aws.SES();
aws.config.update({ region: "us-east-1" });
const uuid = require("uuid/v4");

exports.handler = (event, context, callback) => {
  console.log("Executing lambda function......");
  let message = JSON.parse(event.Records[0].Sns.Message);
  var searchParams = {
    TableName: "dynamo",
    Key: {
      id: message.to
    }
  };
  console.log("Checking if record already present in db");
  /* first we get the item from dynamo and check if email exists
    if does not exist put the item and send an email,
    */
  dynamo.get(searchParams, function(error, data1) {
    if (error) {
      console.log("Error in get", error);
    } else {
      console.log("Success in get", data1);
      console.log(JSON.stringify(data1));
      let isPresent = false;
      if (data1.Item == null || data1.Item == undefined) {
        isPresent = false;
      } else {
        /*
          if email exists check if ttl > currentTime,
          if ttl is greater than current time do nothing,
          else send email
        */
        if (data1.Item.ttl > new Date().getTime()) {
          isPresent = true;
        }
      }
      if (!isPresent) {
        let currentTime = new Date().getTime();
        let ttl = process.env.timeToLive * 60 * 1000;
        let expiry = currentTime + ttl;
        var params = {
          Item: {
            id: message.to,
            token: uuid(),
            ttl: expiry,
            from: message.from,
            recipes: message.recipes
          },
          TableName: "dynamo"
        };

        dynamo.put(params, function(error, data) {
          if (error) {
            console.log("Error", error);
          } else {
            console.log("Success", data);
            const recipeString = params.Item.recipes.reduce((recipeString, recipe) => {
              return recipeString + recipe + "\n";
            }, "");
            var emailParams = {
              Destination: {
                ToAddresses: [
                  params.Item.id
                ]
              },
              Message: {
                Body: {
                  Text: {
                    Charset: "UTF-8",
                    Data: `You have created the following recipes: \n${recipeString}`
                  }
                },
                Subject: {
                  Charset: "UTF-8",
                  Data: "Your list of recipes"
                }
              },
              Source: params.Item.from
            };
            var sendPromise = ses.sendEmail(emailParams).promise();
            sendPromise
              .then(function(data2) {
                console.log(data2);
              })
              .catch(function(err) {
                console.error(err, err.stack);
              });
          }
        });
      } else {
        console.log("Item already present!!!");
      }
    }
  });
};