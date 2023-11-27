module.exports = (fn) => {
 // console.log("koooooo")
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
