export async function isLoggedIn(req, res, next) { 
    if(req.session.user){
        next()
    }else{
        res.render('error/error401')
    }
}