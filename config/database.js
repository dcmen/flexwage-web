const getConnectionString = (dbURL) => {
    return "mongodb+srv://" + process.env.EC2_DB_USER_NAME + ":" + process.env.EC2_DB_PASSWORD + "@" + dbURL + "?retryWrites=true&w=majority";
}
module.exports = {
    'SECRET_KEY': process.env.SECRET_KEY,
    'DB_URL': getConnectionString(process.env.DB_URL)
};
