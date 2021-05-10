var request = require('request');
/**
 * for list of mime-type visit on https://www.freeformatter.com/mime-types-list.html
 */

export async function send(from,to,html,subject,attachments,cc,bcc,token) {
    try{
        // let options={from,to,html,subject,attachments,cc,bcc}
        var options = {
            method: 'POST',
            url: 'https://api.paubox.net/v1/firstvitals/messages.json',
            headers:
            {
              authorization: `Token token=${token}`,
              'content-type': 'application/json'
            },
            body:
            {
              data:
              {
                message:
                {
                  recipients: [to],
                  bcc: bcc,
                  cc: cc,
                  headers:
                  {
                    subject: subject,
                    from: from
                  },
                  content:
                  {
                    'text/plain': 'Hello World!',
                    'text/html': html
                  },
                  attachments:attachments
                }
              }
            },
            json: true
          };
        let resp= await new Promise((resolve,reject)=>{
            request(options, (error, response, body) =>{

            if (error) reject(error);
        
            console.log("paubox response-->",body)
            resolve(body);
            });
        })
        return resp;
    }catch(err){
        throw err;
    }
}
async function checkMailStatus(sourceTrackingId,token){
  let url=`https://api.paubox.net/v1/firstvitals/message_receipt?sourceTrackingId=${sourceTrackingId}`
  var options = {
    method: 'GET',
    url: url,
    headers:
    {
      authorization: `Token token=${token}`,
      'content-type': 'application/json'
    },
    json: true
  };
  let resp= await new Promise((resolve,reject)=>{
    request(options, (error, response, body) =>{
      if (error) reject(error);

      console.log("paubox body-->",JSON.stringify(body));
      resolve(body);
      });
  })
  return resp;
}

module.exports.send=send
module.exports.checkMailStatus=checkMailStatus