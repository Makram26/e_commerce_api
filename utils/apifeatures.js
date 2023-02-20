class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr
    }

    search(){
        const keyword=this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options: "i",
            }
        }:{}
//    console.log(keyword)
        this.query=this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy={...this.queryStr}
        console.log("before",queryCopy)
        // Removing some fields for category
        const removeFields=["keyword","page","limit"];

        removeFields.forEach(key => delete queryCopy[key]);      
        console.log("after",queryCopy)
        // Filter For Price and Rating 
        let queryStr=JSON.stringify(queryCopy)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key) => `$${key}`)

        this.query=this.query.find(JSON.parse(queryStr));
        console.log("query str",queryStr)
        return this
    }

    pagination(resultPerPage){
       const currentPage=Number(this.queryStr.page || 1)   // suppose if 50 products and show 1 page only 10 products Now create a mathematically equation then skip products as request 

       const skip=resultPerPage * (currentPage - 1)


       this.query =this.query.limit(resultPerPage).skip(skip);

       return this;
    }
}


module.exports=ApiFeatures