module.exports =Myfuction => (req,res,next)=> {
    Promise.resolve(Myfuction(req,res,next)).catch(next)
}