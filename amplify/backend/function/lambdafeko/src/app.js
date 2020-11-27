/* Amplify Params - DO NOT EDIT
	API_APIBBASSYNOV_APIID
	API_APIBBASSYNOV_APINAME
	ENV
	REGION
  API_APIBBASSYNOV_APIID
	API_APIBBASSYNOV_APINAME
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
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION })

const dynamodb = new AWS.DynamoDB.DocumentClient()

let TableName = 'dynamoReko'
if (process.env.ENV && process.env.ENV !== 'NONE') {
  TableName = TableName + '-' + process.env.ENV
}

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

const reko = new AWS.Rekognition()

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

/// GET methods

app.get('/reko/:photo', (req, res) => {
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.STORAGE_S3209AF783_BUCKETNAME,
        Name: req.params.photo
      }
    },
    Attributes: ['ALL']
  }
  reko.detectFaces(params, async (err, response) => {
    if (err) {
      console.log(err, err.stack)
      res.json({ error: 'cannot detectFaces', err, stack: err.stack })
    } else {
      const updateParams = {
        TableName,
        Key: {
          file: req.params.photo
        },
        UpdateExpression: 'set labels = :a',
        ExpressionAttributeValues: {
          ':a': response.FaceDetails
        },
        ReturnValues: 'UPDATED_NEW'
      }
      /*const data =*/ await dynamodb.update(updateParams).promise()
      res.json({ success: 'get call succeed!', results: response.FaceDetails })
    }
  })
})

app.get('/reko/*', (req, res) => {
  res.json({ status: 403, message: 'unauthorized' })
})

app.listen(3000, function () {
  console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
