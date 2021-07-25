const AWS = require("aws-sdk");
var scraper = require('table-scraper');
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function putRecord(record) {
        const product_params = {
            TableName: process.env.PRICES_DYNAMODB_TABLE,
            Item: {
                id: uuid.v4(),
                record: record
            }
        };

	await dynamoDb.put(record, error => {
            if (error) {
                console.error(error);
                callback(null, {
                    statusCode: error.statusCode || 501
                });
                return;
            }
        }).promise();
}

module.exports.getCommodityPricesFromWeb = async (event) => {
    scraper
    .get('http://tsmarketing.in/DailyArrivalsnPricesCommoditywise.aspx')
    .then(function(tableData) {
    		let records  = tableData[0] 
        records.forEach( rec => 
        	putRecord(rec)	
        )
      }
    });
};
