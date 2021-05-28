# Database used

MongoDB

# library list

### Front-end

`ejs`

### Back-end

`expressjs` => web app framework
`bcryptjs`, `crypto-js` => for encrypting users' password
`passport` => server-side authentication
`nodemailer` => SMTP email service

# login flow

login => passport checking (email, password) => two factor authen (password + email verification code) => logon => logout
