var authenticated = function authenticated(req, res, next) {
    
    if (req.session.passport.user !== undefined) {
        
        next();
    
    } else {
    
        res.redirect( '/login');
    
    }
}

module.exports = authenticated;