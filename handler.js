const AWS = require("aws-sdk");
var scraper = require('table-scraper');
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// async function putRecord(record) {
//         console.log(record);
//         console.log(process.env.PRICES_DYNAMODB_TABLE);
//         const product_params = {
//             TableName: process.env.PRICES_DYNAMODB_TABLE,
//             Item: {
//                 id: uuid.v4(),
//                 record: record
//             }
//         };
//         console.log(product_params)

// 	await dynamoDb.put(product_params, error => {
//             if (error) {
//                 console.error(error);
//                 callback(null, {
//                     statusCode: error.statusCode || 501
//                 });
//                 return;
//             }
//         }).promise();
// }

module.exports.getCommodityPricesFromWeb = async (event, context, callback) => {

    let product_result = [];
    let price_param ;

    scraper
    .get('http://tsmarketing.in/DailyArrivalsnPricesCommoditywise.aspx')
    .then(function(tableData) {
    		let records  = tableData[0] 
            console.log(process.env.PRICES_DYNAMODB_TABLE);
            records.forEach( rec => {
                price_param = {
                    TableName: process.env.PRICES_DYNAMODB_TABLE,
                    Item: {
                        id: uuid.v4(),
                        record: rec,
                        date : new Date().toISOString()
                    }
                };
                product_result.push(
                    dynamoDb.put(price_param, error => {
                    if (error) {
                    console.error(error);
                    callback(null, {
                        statusCode: error.statusCode || 501
                    });
                    return;
                    }
                }))
            })
      });

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(product_result)
    });

};
