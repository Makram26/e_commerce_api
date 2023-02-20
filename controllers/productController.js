const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const product = require("../modals/productModel");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorHandler");

// Create Product  --- only Admin 
exports.createProduct = catchAsyncErrors(async (req, res, next) => {



    req.body.user = req.user.id;
    const products = await product.create(req.body);


    res.status(201).json({
        success: true,
        products
    })

})



// Get All Products 
exports.getAllProducts = catchAsyncErrors(async (req, res,next) => {


    // return next(new ErrorHandler("This is my temp error checking ",500))

    const resultPerPage = 8;

    const productCount = await product.countDocuments()

    const apiFeature = new ApiFeatures(product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeature.query;
    // console.log(">>>>>>>>",products)
    res.status(200).json({
        success: true,
        productCount,
        products
    })
})

// Get Products Details

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let My_Proudct = await product.findById(req.params.id);

    if (!My_Proudct) {
        return next(new ErrorHandler("Product Not Found!", 500))
    }
    res.status(200).json({
        success: true,
        My_Proudct
    })
})


// Update Product --- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let My_Proudct = await product.findById(req.params.id);

    if (!My_Proudct) {
        return next(new ErrorHandler("Product Not Found!", 500))
    }
    My_Proudct = await product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true, useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        My_Proudct
    })
})


// Delete Products --- Admin 

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const My_product = await product.findById(req.params.id);
    if (!My_product) {
        return next(new ErrorHandler("Product Not Found!", 500))
    }

    //  await product.remove();
    await product.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        message: "Product Delete Successfully!"
    })

})



// Create New Review or Update the review

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    // console.log("........",rating)
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        // productId,
    };
    const my_product = await product.findById(productId);
    const isReviewed = my_product.reviews.find(rev => rev.user.toString() === req.user._id.toString())
    if (isReviewed) {
        my_product.reviews.forEach(rev => {
            console.log("review user id",rev.user.toString())
            console.log(" user id",req.user._id.toString())
            console.log("previous rating",rev.rating)
            console.log("previous comment",rev.comment)


            if (rev.user.toString() === req.user._id.toString()) 
               ( rev.rating = rating),(rev.comment = comment)
               console.log("inside if")
        })
    }
    else {
        console.log("outside if")

        my_product.reviews.push(review)
        my_product.numOfReviews = my_product.reviews.length
    }
    // 4 ,5,5,2=16

    let avg = 0
    my_product.reviews.forEach(rev => { avg += rev.rating })
    my_product.ratings = avg / my_product.reviews.length;
    await my_product.save({
        validateBeforeSave: false
    })
    res.status(200).json({
        success: true,

    })

})



// Get All Reviews of a product
exports.getProductReview=catchAsyncErrors(async (req, res, next) => {
    const My_product = await product.findById(req.query.id);
    
    if (!My_product) {
        return next(new ErrorHandler("Product Not Found!", 500))
    }

    //  await product.remove();
    // await product.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        reviews: My_product.reviews
    })

})

// Delete Review 

exports.deleteReview=catchAsyncErrors(async (req, res, next) => {
    const My_product = await product.findById(req.query.productId);
    if (!My_product) {
        return next(new ErrorHandler("Product Not Found!", 500))
    }

    const review = My_product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())


    let avg = 0
    review.forEach(rev => { avg += rev.rating })
    const ratings = avg / review.length;

   const numOfReviews = review.length

    const productAfterUpdate=await product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews:review,
            ratings,
            numOfReviews
        },
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
    )
    res.status(200).json({
        success: true,
        productAfterUpdate
    })

})