module.exports = {
    ensureAuthenticated: function(request, response, next) {
        if (request.isAuthenticated()){
            return next();
        }
        request.flash('error_msg', 'Login to view');
        response.redirect('/users/login');
    }
}