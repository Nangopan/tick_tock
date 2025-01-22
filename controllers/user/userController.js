const loadSignup=async (req,res)=>{
    try{
        return res.render("signup")
    }
    catch(error){
        console.log("sign up page error",error)
        res.status(500).send("server error")
    }
}



const loadHomePage=async (req,res)=>{
try{
    return res.render("home")
}
catch(error){
 console.log("Home page not found")
 res.status(500).send("Server Error")
}
}

const pageNotFound=async (req,res)=>{
    try{
        res.render('page-404')
    }
    catch(error){
        res.redirect('/pageNotFound')
    }
}


module.exports={
    loadHomePage,
    pageNotFound,
    loadSignup,
}