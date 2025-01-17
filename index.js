const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient()
let program = require('commander');

let electionId;
program
    .version('0.0.1')
    .usage('[options] <electionId>')
    .arguments('<electionId>').action(function (eId) {
        electionId = eId;
    })
    .option("-s, --status [status]", "status of transactions (default all)")
    .option("-r, --rerun", "rerun non-complete transactions")
    .parse(process.argv);

if(program.status && ["pending", "complete", "error"].indexOf(program.status) == -1){
    console.log("status must be pending, complete, or error");
    process.exit(1);
}

if(!electionId){
    console.log("electionId is required (first arg)")
    process.exit(1);
}

let asyncInvokeLambda = (name, payload) => {
    return new Promise((resolve, reject) => {
        try{
            const lambda = new AWS.Lambda({ region: "us-east-1", apiVersion: '2015-03-31' });
            const lambdaParams = {
                FunctionName: name,
                InvocationType: 'Event',
                LogType: 'None',
                Payload: JSON.stringify(payload)
            };
            lambda.invoke(lambdaParams, function(err, data){
                if(err){
                    reject(err)
                } else{
                    resolve(data);
                }
            });
        }catch(e){
            reject(e);
        }
    })
}

const getTransactions = async (electionId, status) => {
    const params = {
        TableName : "votes",
        KeyConditionExpression: "electionId = :eid",
        ExpressionAttributeValues: {
            ":eid": electionId
        }
    };

    let result = []
    let data = await docClient.query(params).promise();

    data.Items.forEach((itm)=>{
        if(!status || itm.txStatus === status){
            result.push(itm);
        }
    })
    return result.sort((a,b)=>{
        return a.txTimestamp - b.txTimestamp;
    })
}


getTransactions(electionId, program.status).then((items) => {
    console.log(JSON.stringify({ tx: items }));
    items.forEach(async (itm) => {
        if(program.rerun && itm.txStatus != "complete"){
            await asyncInvokeLambda("election-cast-vote", itm.event);
        }
    })
})
