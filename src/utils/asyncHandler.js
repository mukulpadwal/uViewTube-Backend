// Working is simple
// we will get an async function we just need to execute it within try/catch or Promises

const asyncHandler = (controllerFunction) => {
  return async (req, res, next) => {
    try {
      await controllerFunction(req, res);
      next();
    } catch (error) {
      console.log(
        `Error while executing controller : ERROR : ${error.message}`
      );
      process.exit(1);
    }
  };
};

export default asyncHandler;
