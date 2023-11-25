const asynchandler = (requesHandler) => {
    return (req, res, next) => {
        Promise.resolve(requesHandler(req, res, next)).catch((error) =>
            next(error)
        );
    };
};

export { asynchandler };

// const asynchandler = () =>{}
// const asynchandler = (fn) => ()=>{}
// const asynchandler = (fn) => async ()=>{}

// const asynchandler = (fn) => async (req,res,next) => { // we can get error
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };