module.exports = () => {
  if (process.env.PORT === undefined) {
    process.env.PORT = 3000;
  }

  if (process.env.MONGO_URL === undefined) {
    process.env.MONGO_URL = 'mongodb://localhost:27017/funhap';
  }
};
