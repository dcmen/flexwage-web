const xml2js = require('xml2js');
const request = require('request');

const companyEntityQuery = async (req, res) => {
  const { apiKey, apiUserName, apiPassword } = req.body;
  let companyList = Array();
  const options = {
    'method': 'POST',
    'url': 'https://api.astutepayroll.com/webservice/',
    'headers': {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'urn:CompanyEntityQuery#CompanyEntityQuery'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> 
      <soap:Body> 
        <CompanyEntityQueryRequest>   
          <userGet>      
            <api_key>${apiKey}</api_key>       
            <api_username>${apiUserName}</api_username>     
            <api_password>${apiPassword}</api_password>    
          </userGet>
        </CompanyEntityQueryRequest>
      </soap:Body>
    </soap:Envelope>`
  };

  request(options, async function (error, response) {
    if (error) {
      console.error(`[Astute][${apiKey}][CompanyEntityQuery API] - Request failed.`);
      return res.status(400).json({code: 400, message: "Request failed"});
    }
    if(response) {
      const { body, statusCode } = response;
      if(statusCode == 200){
        try {
          const parser = new xml2js.Parser({ explicitArray: false });
          const start = body.indexOf("&lt;users&gt;");
          const end = body.indexOf("&lt;/users&gt;");
    
          let data = body.substr(start, end - start + "&lt;/users&gt;".length)
          data = unescapeHTML(data)
          const result = await new Promise((resolve, reject) => parser.parseString(data, (err, result) => {
                              if (err) reject(err);
                              else resolve(result);
                          }))
          if(result != null && result.users != null){
              if(result.users.user[0] == undefined){
                companyList.push(result.users.user)
              } else {
                companyList = result.users.user
              }
          }
          return res.status(200).json({code: 200, result: companyList}); 
        } catch (error) {
          console.error(`[Astute][${apiKey}][CompanyEntityQuery API] - Request failed.`);
          return res.status(200).json({code: 200, result: companyList});
        }
      } else  {
        console.error(`[Astute][${apiKey}][CompanyEntityQuery API] - Request failed.`);
        return res.status(400).json({code: 400, message: "Request failed."});
      } 
    }
  }); 
}

function unescapeHTML(escapedHTML) {
  return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
}

module.exports = {
  companyEntityQuery
}