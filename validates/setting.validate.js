module.exports.validateAba = (req, res, next) => {
  const bankAccountNumber = req.body.bank_account_number;
  if (!/^[0-9]{9,9}$/.test(bankAccountNumber)) {
    req.flash("error", "Bank account number must be 9 digits");
    res.redirect('/admin/settings');
    return;
  }
  next();
}

module.exports.validateFee = (req, res, next) => {
  var numberRegex = /^\s*[+]?(\d+|\.\d+|\d+\.\d+|\d+\.)?\s*$/;
  const fee =  req.body.transaction_fee;
  if(fee && !numberRegex.test(fee)) {
    req.flash("error", "Transaction fees must type number");
    res.redirect('/admin/settings');
    return;
  }
  if (fee && Number(fee) < 0) {
    req.flash("error", "Transaction fees must be greater or equal to 0");
    res.redirect('/admin/settings');
    return;
  }
  next();
}