const { text } = require('body-parser');
var crypto = require('crypto');
var CryptoJS = require("crypto-js");

const algorithm = 'aes-128-cbc';
const iv = "0000000000000000";
const clearEncoding = 'utf8';
const cipherEncoding = 'base64';

async function encryption(key, data) {
    var cipherChunks = [];
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}
module.exports.encryption = encryption;

async function decryption(key, data) {
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
    return cipherChunks.join('');
}
module.exports.decryption = decryption;

async function generateBankNumber(bankAccountNumber) {
    if (bankAccountNumber.length > 3) {
        var asterisk = ""
        for (var t = 0; t < bankAccountNumber.length - 3; t++) {
            asterisk += "*"
        }
        bankAccountNumber = bankAccountNumber.replace(bankAccountNumber.substring(0, bankAccountNumber.length - 3), asterisk)
    }
    return bankAccountNumber;
}
module.exports.generateBankNumber = generateBankNumber;

exports.encryptKeyClient = async (key, data) => {
    // decrypt bank account
    var bytes = CryptoJS.AES.decrypt(data, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // encryption bank account
    var result =  await encryption(key, originalText); 
    return result;
}

exports.decryptionKeyClient = async (key, data) => {
    // decrypt bank account
    let decryptData = await decryption(key, data);
    // encryption bank account
    var result = CryptoJS.AES.encrypt(decryptData, key).toString();
    return result;
}

exports.mobileCountryCode = () => {
    const mobileCountry = [
        { code: "DZ", dial_code: "213", name: "Algeria (+213)" },
        { code: "AD", dial_code: "376", name: "Andorra (+376)" },
        { code: "AO", dial_code: "244", name: "Angola (+244)" },
        { code: "AI", dial_code: "1264", name: "Anguilla (+1264)" },
        { code: "AG", dial_code: "1268", name: "Antigua &amp; Barbuda (+1268)" },
        { code: "AR", dial_code: "54", name: "Argentina (+54)" },
        { code: "AM", dial_code: "374", name: "Armenia (+374)" },
        { code: "AW", dial_code: "297", name: "Aruba (+297)" },
        { code: "GB", dial_code: "61", name: "Australia (+61)" },
        { code: "AT", dial_code: "43", name: "Austria (+43)" },
        { code: "AZ", dial_code: "994", name: "Azerbaijan (+994)" },
        { code: "BS", dial_code: "1242", name: "Bahamas (+1242)" },
        { code: "BH", dial_code: "973", name: "Bahrain (+973)" },
        { code: "BD", dial_code: "880", name: "Bangladesh (+880)" },
        { code: "BB", dial_code: "1246", name: "Barbados (+1246)" },
        { code: "BY", dial_code: "375", name: "Belarus (+375)" },
        { code: "BE", dial_code: "32", name: "Belgium (+32)" },
        { code: "BZ", dial_code: "501", name: "Belize (+501)" },
        { code: "BJ", dial_code: "229", name: "Benin (+229)" },
        { code: "BM", dial_code: "1441", name: "Bermuda (+1441)" },
        { code: "BT", dial_code: "975", name: "Bhutan (+975)" },
        { code: "BO", dial_code: "591", name: "Bolivia (+591)" },
        { code: "BA", dial_code: "387", name: "Bosnia Herzegovina (+387)" },
        { code: "BW", dial_code: "267", name: "Botswana (+267)" },
        { code: "BR", dial_code: "55", name: "Brazil (+55)" },
        { code: "BN", dial_code: "673", name: "Brunei (+673)" },
        { code: "BG", dial_code: "359", name: "Bulgaria (+359)" },
        { code: "BF", dial_code: "226", name: "Burkina Faso (+226)" },
        { code: "BI", dial_code: "257", name: "Burundi (+257)" },
        { code: "KH", dial_code: "855", name: "Cambodia (+855)" },
        { code: "CM", dial_code: "237", name: "Cameroon (+237)" },
        { code: "CA", dial_code: "1", name: "Canada (+1)" },
        { code: "CV", dial_code: "238", name: "Cape Verde Islands (+238)" },
        { code: "KY", dial_code: "1345", name: "Cayman Islands (+1345)" },
        { code: "CF", dial_code: "236", name: "Central African Republic (+236)" },
        { code: "CL", dial_code: "56", name: "Chile (+56)" },
        { code: "CN", dial_code: "86", name: "China (+86)" },
        { code: "CO", dial_code: "57", name: "Colombia (+57)" },
        { code: "KM", dial_code: "269", name: "Comoros (+269)" },
        { code: "CG", dial_code: "242", name: "Congo (+242)" },
        { code: "CK", dial_code: "682", name: "Cook Islands (+682)" },
        { code: "CR", dial_code: "506", name: "Costa Rica (+506)" },
        { code: "HR", dial_code: "385", name: "Croatia (+385)" },
        { code: "CU", dial_code: "53", name: "Cuba (+53)" },
        { code: "CY", dial_code: "90392", name: "Cyprus North (+90392)" },
        { code: "CY", dial_code: "357", name: "Cyprus South (+357)" },
        { code: "CZ", dial_code: "42", name: "Czech Republic (+42)" },
        { code: "DK", dial_code: "45", name: "Denmark (+45)" },
        { code: "DJ", dial_code: "253", name: "Djibouti (+253)" },
        { code: "DM", dial_code: "1809", name: "Dominica (+1809)" },
        { code: "DO", dial_code: "1809", name: "Dominican Republic (+1809)" },
        { code: "EC", dial_code: "593", name: "Ecuador (+593)" },
        { code: "EG", dial_code: "20", name: "Egypt (+20)" },
        { code: "SV", dial_code: "503", name: "El Salvador (+503)" },
        { code: "GQ", dial_code: "240", name: "Equatorial Guinea (+240)" },
        { code: "ER", dial_code: "291", name: "Eritrea (+291)" },
        { code: "EE", dial_code: "372", name: "Estonia (+372)" },
        { code: "ET", dial_code: "251", name: "Ethiopia (+251)" },
        { code: "FK", dial_code: "500", name: "Falkland Islands (+500)" },
        { code: "FO", dial_code: "298", name: "Faroe Islands (+298)" },
        { code: "FJ", dial_code: "679", name: "Fiji (+679)" },
        { code: "FI", dial_code: "358", name: "Finland (+358)" },
        { code: "FR", dial_code: "33", name: "France (+33)" },
        { code: "GF", dial_code: "594", name: "French Guiana (+594)" },
        { code: "PF", dial_code: "689", name: "French Polynesia (+689)" },
        { code: "GA", dial_code: "241", name: "Gabon (+241)" },
        { code: "GM", dial_code: "220", name: "Gambia (+220)" },
        { code: "GE", dial_code: "7880", name: "Georgia (+7880)" },
        { code: "DE", dial_code: "49", name: "Germany (+49)" },
        { code: "GH", dial_code: "233", name: "Ghana (+233)" },
        { code: "GI", dial_code: "350", name: "Gibraltar (+350)" },
        { code: "GR", dial_code: "30", name: "Greece (+30)" },
        { code: "GL", dial_code: "299", name: "Greenland (+299)" },
        { code: "GD", dial_code: "1473", name: "Grenada (+1473)" },
        { code: "GP", dial_code: "590", name: "Guadeloupe (+590)" },
        { code: "GU", dial_code: "671", name: "Guam (+671)" },
        { code: "GT", dial_code: "502", name: "Guatemala (+502)" },
        { code: "GN", dial_code: "224", name: "Guinea (+224)" },
        { code: "GW", dial_code: "245", name: "Guinea - Bissau (+245)" },
        { code: "GY", dial_code: "592", name: "Guyana (+592)" },
        { code: "HT", dial_code: "509", name: "Haiti (+509)" },
        { code: "HN", dial_code: "504", name: "Honduras (+504)" },
        { code: "HK", dial_code: "852", name: "Hong Kong (+852)" },
        { code: "HU", dial_code: "36", name: "Hungary (+36)" },
        { code: "IS", dial_code: "354", name: "Iceland (+354)" },
        { code: "IN", dial_code: "91", name: "India (+91)" },
        { code: "ID", dial_code: "62", name: "Indonesia (+62)" },
        { code: "IR", dial_code: "98", name: "Iran (+98)" },
        { code: "IQ", dial_code: "964", name: "Iraq (+964)" },
        { code: "IE", dial_code: "353", name: "Ireland (+353)" },
        { code: "IL", dial_code: "972", name: "Israel (+972)" },
        { code: "IT", dial_code: "39", name: "Italy (+39)" },
        { code: "JM", dial_code: "1876", name: "Jamaica (+1876)" },
        { code: "JP", dial_code: "81", name: "Japan (+81)" },
        { code: "JO", dial_code: "962", name: "Jordan (+962)" },
        { code: "KZ", dial_code: "7", name: "Kazakhstan (+7)" },
        { code: "KE", dial_code: "254", name: "Kenya (+254)" },
        { code: "KI", dial_code: "686", name: "Kiribati (+686)" },
        { code: "KP", dial_code: "850", name: "Korea North (+850)" },
        { code: "KR", dial_code: "82", name: "Korea South (+82)" },
        { code: "KW", dial_code: "965", name: "Kuwait (+965)" },
        { code: "KG", dial_code: "996", name: "Kyrgyzstan (+996)" },
        { code: "LA", dial_code: "856", name: "Laos (+856)" },
        { code: "LV", dial_code: "371", name: "Latvia (+371)" },
        { code: "LB", dial_code: "961", name: "Lebanon (+961)" },
        { code: "LS", dial_code: "266", name: "Lesotho (+266)" },
        { code: "LR", dial_code: "231", name: "Liberia (+231)" },
        { code: "LY", dial_code: "218", name: "Libya (+218)" },
        { code: "LI", dial_code: "417", name: "Liechtenstein (+417)" },
        { code: "LT", dial_code: "370", name: "Lithuania (+370)" },
        { code: "LU", dial_code: "352", name: "Luxembourg (+352)" },
        { code: "MO", dial_code: "853", name: "Macao (+853)" },
        { code: "MK", dial_code: "389", name: "Macedonia (+389)" },
        { code: "MG", dial_code: "261", name: "Madagascar (+261)" },
        { code: "MW", dial_code: "265", name: "Malawi (+265)" },
        { code: "MY", dial_code: "60", name: "Malaysia (+60)" },
        { code: "MV", dial_code: "960", name: "Maldives (+960)" },
        { code: "ML", dial_code: "223", name: "Mali (+223)" },
        { code: "MT", dial_code: "356", name: "Malta (+356)" },
        { code: "MH", dial_code: "692", name: "Marshall Islands (+692)" },
        { code: "MQ", dial_code: "596", name: "Martinique (+596)" },
        { code: "MR", dial_code: "222", name: "Mauritania (+222)" },
        { code: "YT", dial_code: "269", name: "Mayotte (+269)" },
        { code: "MX", dial_code: "52", name: "Mexico (+52)" },
        { code: "FM", dial_code: "691", name: "Micronesia (+691)" },
        { code: "MD", dial_code: "373", name: "Moldova (+373)" },
        { code: "MC", dial_code: "377", name: "Monaco (+377)" },
        { code: "MN", dial_code: "976", name: "Mongolia (+976)" },
        { code: "MS", dial_code: "1664", name: "Montserrat (+1664)" },
        { code: "MA", dial_code: "212", name: "Morocco (+212)" },
        { code: "MZ", dial_code: "258", name: "Mozambique (+258)" },
        { code: "MN", dial_code: "95", name: "Myanmar (+95)" },
        { code: "NA", dial_code: "264", name: "Namibia (+264)" },
        { code: "NR", dial_code: "674", name: "Nauru (+674)" },
        { code: "NP", dial_code: "977", name: "Nepal (+977)" },
        { code: "NL", dial_code: "31", name: "Netherlands (+31)" },
        { code: "NC", dial_code: "687", name: "New Caledonia (+687)" },
        { code: "NZ", dial_code: "64", name: "New Zealand (+64)" },
        { code: "NI", dial_code: "505", name: "Nicaragua (+505)" },
        { code: "NE", dial_code: "227", name: "Niger (+227)" },
        { code: "NG", dial_code: "234", name: "Nigeria (+234)" },
        { code: "NU", dial_code: "683", name: "Niue (+683)" },
        { code: "NF", dial_code: "672", name: "Norfolk Islands (+672)" },
        { code: "NP", dial_code: "670", name: "Northern Marianas (+670)" },
        { code: "NO", dial_code: "47", name: "Norway (+47)" },
        { code: "OM", dial_code: "968", name: "Oman (+968)" },
        { code: "PW", dial_code: "680", name: "Palau (+680)" },
        { code: "PA", dial_code: "507", name: "Panama (+507)" },
        { code: "PG", dial_code: "675", name: "Papua New Guinea (+675)" },
        { code: "PY", dial_code: "595", name: "Paraguay (+595)" },
        { code: "PE", dial_code: "51", name: "Peru (+51)" },
        { code: "PH", dial_code: "63", name: "Philippines (+63)" },
        { code: "PL", dial_code: "48", name: "Poland (+48)" },
        { code: "PT", dial_code: "351", name: "Portugal (+351)" },
        { code: "PR", dial_code: "1787", name: "Puerto Rico (+1787)" },
        { code: "QA", dial_code: "974", name: "Qatar (+974)" },
        { code: "RE", dial_code: "262", name: "Reunion (+262)" },
        { code: "RO", dial_code: "40", name: "Romania (+40)" },
        { code: "RU", dial_code: "7", name: "Russia (+7)" },
        { code: "RW", dial_code: "250", name: "Rwanda (+250)" },
        { code: "SM", dial_code: "378", name: "San Marino (+378)" },
        { code: "ST", dial_code: "239", name: "Sao Tome &amp; Principe (+239)" },
        { code: "SA", dial_code: "966", name: "Saudi Arabia (+966)" },
        { code: "SN", dial_code: "221", name: "Senegal (+221)" },
        { code: "CS", dial_code: "381", name: "Serbia (+381)" },
        { code: "SC", dial_code: "248", name: "Seychelles (+248)" },
        { code: "SL", dial_code: "232", name: "Sierra Leone (+232)" },
        { code: "SG", dial_code: "65", name: "Singapore (+65)" },
        { code: "SK", dial_code: "421", name: "Slovak Republic (+421)" },
        { code: "SI", dial_code: "386", name: "Slovenia (+386)" },
        { code: "SB", dial_code: "677", name: "Solomon Islands (+677)" },
        { code: "SO", dial_code: "252", name: "Somalia (+252)" },
        { code: "ZA", dial_code: "27", name: "South Africa (+27)" },
        { code: "ES", dial_code: "34", name: "Spain (+34)" },
        { code: "LK", dial_code: "94", name: "Sri Lanka (+94)" },
        { code: "SH", dial_code: "290", name: "St. Helena (+290)" },
        { code: "KN", dial_code: "1869", name: "St. Kitts (+1869)" },
        { code: "SC", dial_code: "1758", name: "St. Lucia (+1758)" },
        { code: "SD", dial_code: "249", name: "Sudan (+249)" },
        { code: "SR", dial_code: "597", name: "Suriname (+597)" },
        { code: "SZ", dial_code: "268", name: "Swaziland (+268)" },
        { code: "SE", dial_code: "46", name: "Sweden (+46)" },
        { code: "CH", dial_code: "41", name: "Switzerland (+41)" },
        { code: "SI", dial_code: "963", name: "Syria (+963)" },
        { code: "TW", dial_code: "886", name: "Taiwan (+886)" },
        { code: "TJ", dial_code: "7", name: "Tajikstan (+7)" },
        { code: "TH", dial_code: "66", name: "Thailand (+66)" },
        { code: "TG", dial_code: "228", name: "Togo (+228)" },
        { code: "TO", dial_code: "676", name: "Tonga (+676)" },
        { code: "TT", dial_code: "1868", name: "Trinidad &amp; Tobago (+1868)" },
        { code: "TN", dial_code: "216", name: "Tunisia (+216)" },
        { code: "TR", dial_code: "90", name: "Turkey (+90)" },
        { code: "TM", dial_code: "7", name: "Turkmenistan (+7)" },
        { code: "TM", dial_code: "993", name: "Turkmenistan (+993)" },
        { code: "TC", dial_code: "1649", name: "Turks &amp; Caicos Islands (+1649)" },
        { code: "TV", dial_code: "688", name: "Tuvalu (+688)" },
        { code: "UG", dial_code: "256", name: "Uganda (+256)" },
        { code: "GB", dial_code: "44", name: "UK (+44)" },
        { code: "UA", dial_code: "380", name: "Ukraine (+380)" },
        { code: "AE", dial_code: "971", name: "United Arab Emirates (+971)" },
        { code: "UY", dial_code: "598", name: "Uruguay (+598)" },
        { code: "US", dial_code: "1", name: "USA (+1)" },
        { code: "UZ", dial_code: "7", name: "Uzbekistan (+7)" },
        { code: "VU", dial_code: "678", name: "Vanuatu (+678)" },
        { code: "VA", dial_code: "379", name: "Vatican City (+379)" },
        { code: "VE", dial_code: "58", name: "Venezuela (+58)" },
        { code: "VN", dial_code: "84", name: "Vietnam (+84)" },
        { code: "VG", dial_code: "1284", name: "Virgin Islands - British (+1284)" },
        { code: "VI", dial_code: "1340", name: "Virgin Islands - US (+1340)" },
        { code: "WF", dial_code: "681", name: "Wallis &amp; Futuna (+681)" },
        { code: "YE", dial_code: "969", name: "Yemen (North)(+969)" },
        { code: "YE", dial_code: "967", name: "Yemen (South)(+967)" },
        { code: "ZM", dial_code: "260", name: "Zambia (+260)" },
        { code: "ZW", dial_code: "263", name: "Zimbabwe (+263)" }
        ];
    return mobileCountry;
}