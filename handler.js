const AWS = require("aws-sdk");
var scraper = require('table-scraper');
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getCommodityPricesFromWeb = async (event, context, callback) => {

    let product_result = [];
    let price_param;
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const day = new Date().getDate()
    const date = new Date(year, month, day).getTime();

    scraper
        .get('http://tsmarketing.in/DailyArrivalsnPricesCommoditywise.aspx')
        .then(function (tableData) {
            let records = tableData[0]
            const ttl = Math.floor((date) / 1000)
            console.log(process.env.PRICES_DYNAMODB_TABLE);
            records.forEach(rec => {
                price_param = {
                    TableName: process.env.PRICES_DYNAMODB_TABLE,
                    Item: {
                        id: uuid.v4(),
                        commodityName: rec['Commodity Name'],
                        varietyName: rec['Variety Name'],
                        marketName: rec['Market Name'],
                        arrivals: rec['Arrivals(Qtls)'],
                        maximum: rec['Maximum'],
                        minimum: rec['Minimum'],
                        model: rec['Model'],
                        purchaseBy: rec['Purchase By'],
                        dateVal: ttl
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


module.exports.getPricingInformation = async (event, context, callback) => {
    console.log(event.pathParameters);
    const dateSplit = event.pathParameters.dateVal.split('-');
    const timeKey  = new Date(dateSplit[0],dateSplit[1], dateSplit[2]).getTime()
    const timeVal = Math.floor((timeKey) / 1000)
    console.log(timeVal)
    const priceParams = {
        TableName: process.env.PRICES_DYNAMODB_TABLE,
        FilterExpression: 'dateVal = :dateVal',
        ExpressionAttributeValues: {
            ':dateVal': Number(timeVal)
        },
    };

    let priceResult = await dynamoDb.scan(priceParams, error => {
        if (error) {
            console.error(error);

            callback(null, {
                statusCode: error.statusCode || 501
            });
            return;
        }
    }).promise();

    console.log(priceResult)

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(priceResult)
    });

}
