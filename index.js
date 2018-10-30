const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser')
const db = require("./db/db.js");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bc = require("./db/bcrypt.js")
const bcrypt = require('./db/bcrypt')
const csurf = require('csurf')
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3");
const config = require("./config");
const server = require('http').Server(app);
const csv = require('csv-parser')
const fs = require('fs')

let domain
if (process.env.NODE_ENV == "production") {
    domain = 'https://aipark-coding-challenge.herokuapp.com:*'
} else {
    domain = 'localhost:8080'
}

// const io = require('socket.io')(server, { origins: domain });

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});
var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

const sessMiddleware = cookieSession({
       secret: `I'm always angry.`,
       maxAge: 1000 * 60 * 60 * 24 * 14
   })

app.use(sessMiddleware);
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(csurf());
app.use(function(req, res, next){
    res.cookie('mytoken', req.csrfToken());
    next();
});

app.use(express.static("./public"))

app.use(compression());

if (process.env.NODE_ENV != 'production') {
    app.use(
        '/bundle.js',
        require('http-proxy-middleware')({
            target: 'http://localhost:8081/'
        })
    );
} else {
    app.use('/bundle.js', (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

//////////////// ROUTES ///////////////////
var workingData

async function processUserData(data) {
    var newData = data
    await newData.sort()
    var userAlias = []
    var counter = 0
    await newData.forEach(async (item, index) => {
        if (index <= 0) {
            userAlias.push(item)
        } else {
            if (userAlias[counter] === item) {
            } else {
                counter = (counter+1)
                userAlias.push(item)
            }
        }
    })
    return userAlias
}

async function processParkingData(data) {
    var newData = data
    await newData.sort()
    var idsList = []
    var counter = 0
    await newData.forEach(async (item, index) => {
        if (index <= 0) {
            idsList.push(item)
        } else {
            if (idsList[counter] === item) {
            } else {
                counter = (counter+1)
                idsList.push(item)
            }
        }
    })
    return idsList
}

async function filterData(filters, data) {
    var filteredData = []
    var newFilters = {}
    for (var i = 0; i < filters.length; i++) {
        if (filters[i].text === "Parking/s") {
            newFilters.parkings = filters[i].list
        }
        if (filters[i].text === "Action/s") {
            newFilters.actions = filters[i].list
        }
        if (filters[i].text === "Team member/s") {
            newFilters.teamMembers = filters[i].list
        }
        if (filters[i].text === "Date") {
            newFilters.dates = {}
            if (filters[i].startingDate) {
                newFilters.dates.startingDate = filters[i].startingDate
            }
            if (filters[i].endDate) {
                newFilters.dates.endDate = filters[i].endDate
            }
        }
    }
    for (var i = 0; i < data.length; i++) {
        var matches = ""
        if (newFilters.parkings) {
            for (var j = 0; j < newFilters.parkings.length; j++) {
                if (newFilters.parkings[j] === data[i].parkingarea_id) {
                    matches += "a"
                    break
                }
            }
        }
        if (newFilters.actions) {
            for (var j = 0; j < newFilters.actions.length; j++) {
                if (newFilters.actions[j] === data[i].action) {
                    matches += "a"
                    break
                }
            }
        }
        if (newFilters.teamMembers) {
            for (var j = 0; j < newFilters.teamMembers.length; j++) {
                if (newFilters.teamMembers[j] === data[i].username_alias) {
                    matches += "a"
                    break
                }
            }
        }
        if (newFilters.dates) {
            var filterStartDate = new Date(newFilters.dates.startingDate)
            var filterEndDate = new Date(newFilters.dates.endDate)
            var rowDate = new Date(data[i].date_in_central_european_time)
            if (newFilters.dates.startingDate && newFilters.dates.endDate) {
                if (checkDate1BiggerThan(rowDate, filterStartDate) && checkDate1SmallerThan(rowDate, filterEndDate)) {
                    matches += "a"
                }
            } else if (!newFilters.dates.startingDate && newFilters.dates.endDate) {
                if (checkDate1SmallerThan(rowDate, filterEndDate)) {
                    matches += "a"
                }
            } else if (newFilters.dates.startingDate && !newFilters.dates.endDate) {
                if (checkDate1BiggerThan(rowDate, filterStartDate)) {
                    matches += "a"
                }
            }
        }
        ///////// check if push //////////
        if (matches.length === filters.length) {
            filteredData.push(data[i])
        }
    }
    return {filteredData: filteredData, filters: newFilters}
}

function checkDate1BiggerThan(date1, date2) {
    // var result = false
    if (date1.getYear() > date2.getYear()) {
        return true
    } else if (date1.getYear() < date2.getYear()) {
        return false
    } else if (date1.getYear() === date2.getYear()) {
        if (date1.getMonth() > date2.getMonth()) {
            return true
        } else if (date1.getMonth() < date2.getMonth()) {
            return false
        } else if (date1.getMonth() === date2.getMonth()) {
            if (date1.getDay() > date2.getDay()) {
                return true
            } else if (date1.getDay() < date2.getDay()) {
                return false
            } else if (date1.getDay() === date2.getDay()) {
                return true
            }
        }
    }
}
function checkDate1SmallerThan(date1, date2) {
    if (date1.getYear() > date2.getYear()) {
        return false
    } else if (date1.getYear() < date2.getYear()) {
        return true
    } else if (date1.getYear() === date2.getYear()) {
        if (date1.getMonth() > date2.getMonth()) {
            return false
        } else if (date1.getMonth() < date2.getMonth()) {
            return true
        } else if (date1.getMonth() === date2.getMonth()) {
            if (date1.getDay() > date2.getDay()) {
                return false
            } else if (date1.getDay() < date2.getDay()) {
                return true
            } else if (date1.getDay() === date2.getDay()) {
                return false
            }
        }
    }
}

app.get('/data.json', function(req, res) {
    const results = [];
    const users = []
    const parkingAreasids = []

    fs.createReadStream('./public/export-logparkingareaupdate.csv')
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
            users.push(data.username_alias)
            parkingAreasids.push(data.parkingarea_id)
        })
        .on('end', async () => {
            workingData = results
            var listOfUsers = await processUserData(users)
            var listOfParkings = await processParkingData(parkingAreasids)
            await res.json({listOfUsers: listOfUsers, listOfParkings: listOfParkings})
        });
});

app.post("/filters.json", async (req, res) => {
    const results = [];
    var filteredData = []
    fs.createReadStream('./public/export-logparkingareaupdate.csv')
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', async () => {
            workingData = results
            filteredData = await filterData(req.body, results)
            await res.json({ success: true, filteredData: filteredData.filteredData, filters: filteredData.filters })
        });
})

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8080, function() {
    console.log("I'm listening.");
});
