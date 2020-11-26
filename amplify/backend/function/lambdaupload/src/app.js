/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_DYNAMOBBAAS_ARN
	STORAGE_DYNAMOBBAAS_NAME
	STORAGE_S3209AF783_BUCKETNAME
Amplify Params - DO NOT EDIT *//*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk')
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { v4: uuidv4 } = require('uuid')

const s3 = new AWS.S3()
const dynamoDb = new AWS.DynamoDB.DocumentClient()

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "dynamobbaas";
if (process.env.ENV && process.env.ENV !== 'NONE') {
  TableName = TableName + '-' + process.env.ENV
}
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

/// GET methods

app.get('/upload/:user', async (req, res) => {
  try {
    const queryByUserParams = {
      TableName,
      IndexName: 'CognitoUser-index',
      KeyConditionExpression: 'CognitoUser = :u',
      ExpressionAttributeValues: {
        ':u': req.params.user
      }
    }
    const queryResult = await dynamoDb.query(queryByUserParams).promise()
    let files = []
    queryResult.Items.forEach((item) => files.push(item.file))
    const params = {
      Bucket: process.env.STORAGE_S3209AF783_BUCKETNAME
    }
    s3.listObjectsV2(params, async (err, data) => {
      if (err) {
        console.log(err, err.stack)
        res.json({ error: 'cannot get your picture', err, stack: err.stack })
      } else {
        let results = []
        for (image of data.Contents) {
          // Filter S3 objects by user
          if (files.includes(image.Key)) {
            const url = await s3.getSignedUrlPromise('getObject', { ...params, Key: image.Key })
            results.push({ url, key: image.Key })
          }
        }
        res.json({ success: 'get call succeed!', results })
      }
    })
  } catch (err) {
    console.log(err)
    res.json({ error: 'cannot query dynamo db', err })
  }
})

app.get('/upload/*', (req, res) => {
  res.json({ status: 403, message: 'unauthorized' })
})

/// POST methods

app.post('/upload', (req, res) => {
  const base64Data = new Buffer.from(req.body.file.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  const type = req.body.file.split(';')[0].split('/')[1]

  const params = {
    Bucket: process.env.STORAGE_S3209AF783_BUCKETNAME,
    Key: `${uuidv4()}.jpg`,
    Body: base64Data,
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  }

  s3.putObject(params, async (err, data) => {
    if (err) {
      console.log(err, err.stack)
      res.json({ error: 'cannot upload your picture', stack: err.stack })
    } else {
      const putParams = {
        TableName,
        Item: {
          file: params.Key,
          CognitoUser: req.body.username
        }
      }
      await dynamoDb.put(putParams).promise()
      res.json({ success: 'post call succeed!', data })
    }
  })
})

app.post('/upload/*', (req, res) => {
  res.json({ status: 403, message: 'unauthorized' })
})

app.listen(3000, () => {
  console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app