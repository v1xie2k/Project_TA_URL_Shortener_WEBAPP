export async function isLoggedIn(req, res, next) { 
    if(req.session.user){
        next()
    }else{
        res.render('error/error401')
    }
}

export async function isAdmin(req, res, next) {  
    if(req.session.user){
        if(req.session.user.role == 'admin'){
            next()
        }else{
            res.render('error/error403')
        }
    }else{
        res.render('error/error401')
    }
}