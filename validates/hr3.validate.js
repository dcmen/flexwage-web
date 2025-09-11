const validateParamAPIUserAuthorized = async (req, res, next) => {
  try {
    const {userNameHR3, passwordHR3, apiKeyRH3} = req.body;
    if (userNameHR3 && passwordHR3 && apiKeyRH3) {
      next();
    } else {
      return res.status(400).json({code: 400, message: "Invalidate prams."});
    }
  } catch (ex) {
    console.log(ex);
    return res.status(400).json({code: 400, message: "Invalidate prams."});
  }
}

module.exports = {
  validateParamAPIUserAuthorized
}