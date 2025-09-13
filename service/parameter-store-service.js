require('dotenv').config();
const {SSMClient, GetParametersByPathCommand, GetParameterCommand} = require("@aws-sdk/client-ssm");

/**
 * ParameterStoreService is a Singleton that is responsible for
 * getting program's properties from AWS Parameter Store and
 * assign those values to process.env
 * */
class ParameterStoreService {

    static #instance;
    #ssm;
    #env;

    /**
     * Static method to get single instance of this class.
     * This method is not thread-safe. If multiple processes
     * call it at the same time, multiple instances might be
     * created
     * @return {ParameterStoreService}*/
    static getInstance() {

        if (!ParameterStoreService.#instance) {
            ParameterStoreService.#instance = new ParameterStoreService();
            ParameterStoreService.#instance.initializeSMSconnection();
        }
        return ParameterStoreService.#instance;
    }

    /**
     * Initialize connection to AWS SMS by sending accessKey, secretKey got from AWS credential config file
     * @return void
     */
    initializeSMSconnection() {
        this.#env = process.env.TYPE;
        const region = "ap-southeast-2";
        this.#ssm = new SSMClient({region});
    }

    /**
     * Get all decrypted parameters that is prefixed with current environment's name, either dev, test or prod.
     * @return {void}
     */
    async getProperties() {
        const query = {
            Path: "/" + this.#env + "/",
            WithDecryption: true
        }
        /*The GetParametersByPathCommand does not return all parameters at once,
        * it only return a portion with a NextToken to get the next list of params.
        * The stack is to iteratively get the portion of params until no NextToken is
        * returned (i.e. all params has been returned)*/
        let nextTokensStack = [];
        nextTokensStack.push("");
        while (nextTokensStack.length > 0) {
            const NextToken = nextTokensStack.pop();
            if (NextToken) {
                query.NextToken = NextToken;
            }
            const command = new GetParametersByPathCommand(query);
            const response = await this.#ssm.send(command);
            response.Parameters.forEach(param => {
                /*Assign param value to process.env*/
                process.env[param.Name.replace("/" + this.#env + "/", "")] = param.Value;
            })
            if (response.NextToken) {
                nextTokensStack.push(response.NextToken)
            }
        }
    }

    /**
     * Get decrypted parameter by parameter name.
     * @param {string} parameter  - parameter name to search
     * @return {void}
     */
    async getProperty(parameter) {
        const query = {
            Name: "/" + this.#env + "/" + parameter,
            WithDecryption: true
        }
        const command = new GetParameterCommand(query);
        const response = await this.#ssm.send(command);
        /*Assign param value to process.env*/
        process.env[response.Parameter.Name.replace("/" + this.#env + "/", "")] = response.Parameter.Value;
    }
}

module.exports = ParameterStoreService;
