class appError extends Error {
  //Inheirtance
  constructor(message, statusCode) {
    super(message); //To call the parent constructor (Error class)
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //Marking those errors by this property to specify if the error is operational or programming
    Error.captureStackTrace(this, this.constructor);
    //console.log(this.stack);
  }
}

module.exports = appError;
