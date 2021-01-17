//Instead of using try/catch block in each route handler, we will chain the promise to a catch method
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //catch(err=>next(err)
  };
};
//The function fn returns a promise, we can chain a catch method to it
