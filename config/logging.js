const setting = require('../config/settings');
const fs = require('fs');


// login log
const log_login_data = fs.readFileSync('./log/log_login.json');
const log_login = JSON.parse(log_login_data);

// token log
const log_token_data = fs.readFileSync('./log/log_token.json');
const log_token = JSON.parse(log_token_data);

exports.getLoginLog = () => {
    console.log(log_login);
}

exports.getTokenLog = () => {
    console.log(log_token);
}

exports.getUserLoginLog = (email) => {
    var target = findLoginLog(email);
    if (target == -1) return target;
    return log_login[target].data;
}

exports.findToken = (email) => {
    var target = findTokenLog(email);
    if (target == -1) return target;
    return log_token[target].data.token;
}

exports.updateTokenLog = (email, token) => {
    var temp = {
        "email": email,
        "data": {
            "token": token
        }
    }

    var target = findTokenLog(email);
    if (target != -1) {
        log_token[target] = temp
    } else {
        log_token.push(temp);
    }

    fs.writeFile('./log/log_token.json', JSON.stringify(log_token), (e) => { });
}

exports.updateLoginLog = (data, times = 1) => {
    // console.log("update", data.email);

    var target = findLoginLog(data.email);

    if (target != -1) {
        if (Date.now() - log_login[target].data.date > setting.login_gap_in_sencond * 1000) {
            var temp = {
                "email": data.email,
                "data": {
                    "date": Date.now(),
                    "time": times
                }
            };
        } else {
            var temp = {
                "email": data.email,
                "data": {
                    "date": log_login[target].data.date,
                    "time": log_login[target].data.time + 1
                }
            };
        }

        log_login[target] = temp;
    } else {
        var temp = {
            "email": data.email,
            "data": {
                "date": data.date,
                "time": times
            }
        };
        log_login.push(temp);
    }
    fs.writeFile('./log/log_login.json', JSON.stringify(log_login), (e) => { });
}

function findLoginLog(target) {
    for (var i = 0; i < log_login.length; i += 1) {
        if (log_login[i].email == target) {
            return i;
        }
    }
    return -1;
}

function findTokenLog(target) {
    for (var i = 0; i < log_token.length; i += 1) {
        if (log_token[i].email == target) {
            return i;
        }
    }
    return -1;
}