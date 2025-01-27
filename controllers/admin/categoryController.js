const Category=require("../../models/categorySchema")


const categoryInfo=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)
        const limit=4
        const skip=(page-1)*limit

    const categoryData= await categoryInfo.find({})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalCategories=await categoryData.countDocuments()
    const totalPages=Math.ceil(totalCategories/limit)
    res.render("category",{
        cat:categoryData,
        currentPage:page,
        totalPages:totalPages,
        totalCategories:totalCategories
    })
    } catch (error) {
        console.error("Error in loading categories",error)
        res.redirect("/pageerror")
    }
    
}


const addCategory=async (req,res)=>{
    const {name,description}=req.body

    try{
        const existingCategory=await categoryInfo.findOne({})
        if(existingCategory){
            return res.status(400).json({error:"Category already exists"})
        }
        const newCategory=new category({
            name,
            description,
        })
        await newCategory.save();
        return res.json({message:"Category added successfully"})
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"})
    }
}

module.exports={
    addCategory,categoryInfo
}