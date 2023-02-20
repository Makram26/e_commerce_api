const Order = require("../modals/orderModel")
const product = require("../modals/productModel");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");


// Create new Order 

exports.newOrder = catchAsyncErrors(async (req, res, next) => {


    console.log("asdlfkjasd;lfjsalkjfd")
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;



    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    })

    console.log(">>>>>>>>>", order)

    res.status(200).json({
        success: true,
        order
    })


})



// get Single Order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order
    })

})



// get logged in user Order 
exports.myOrders = catchAsyncErrors(async (req, res, next) => {


    const orders = await Order.find({ user: req.user._id })



    res.status(200).json({
        success: true,
        orders
    })

})


// get all Order -- admin 
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {


    const orders = await Order.find()

    let totalAmount = 0


    orders.forEach(order => {
        totalAmount += order.totalPrice
    })


    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })

})


// update Order Status  -- admin 
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {


    const order = await Order.findById(req.params.id);
 

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400))
    }


    order.orderItems.forEach(async (order) =>{
        await updateStock(order.product,order.quantity)
    })
    

    order.orderStatus=req.body.status;

    if(req.body.status === "Delivered"){
      order.deliveredAt = Date.now();
    }


  
  await order.save({validateBeforeSave:false})

    res.status(200).json({
        success: true,
       
    })

})


async function updateStock (id,quantity) {
    const products=await product.findById(id);


    products.Stock -= quantity

    await products.save({validateBeforeSave:false})
}


// delete Order -- admin 
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {


    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await Order.findByIdAndDelete(req.params.id)


    res.status(200).json({
        success: true,
       
    })

})



