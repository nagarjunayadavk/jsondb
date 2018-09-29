// Author = Nagarjuna Yadav K.
const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "Nagarjuna Yadav";


const server = jsonServer.create();
server.use(bodyParser.json());//=== This is required to read as body or params or headers

const filename = path.join(__dirname, 'data', 'users.json');
//Access-Control-Allow-Origin
server.use((req, resp, next) => {
    resp.set('Access-Control-Allow-Origin', '*');
    resp.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    resp.set('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization');
    next();// it require////

});


//to Accept all requests of OPTIONS
server.options('/*', (req, resp) => {
    resp.end();
})

//======== check user is alredy exists or not.
const verifyUser = (email, username) => {
    console.log("verifyUser");
    data = fs.readFileSync(filename, 'utf-8');//if file is alredy exists
    data = JSON.parse(data);
    const index = data.findIndex(c => c.email === email && c.username === username);
    console.log('index', index);
    if (index === -1) {
        return false;
    }
    else {
        return data[index];
    }
}

server.post('/users', (req, resp) => {
    console.log("Post Request for /users");
    console.log(req.body);

    const filename = path.join(__dirname, 'data', 'users.json');
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            data = '[]';// Defullt carete userjson.file and insert [] array
        }
        data = JSON.parse(data);
        let maxId = data.reduce((acc, cust) => acc > cust.id ? acc : cust.id, 0);
        req.body['id'] = maxId + 1;
        data.push({ ...req.body })// === push same ojbect to json file with out modify

        //===== Check user is alredy exists or not
        let { email, username } = req.body;
        let user = verifyUser(email, username);
        console.log('user', user);
        if (user) {//
            let { id, username } = user;
            resp.json({ id, username, messge: "user is alredy exits.please check Username." });

        } else {//===== if user not exists in DB insert
            fs.writeFile(filename, JSON.stringify(data), 'utf-8', (err, doc) => {
                if (err) throw err;

                let { id, username } = req.body;
                let token = jwt.sign({ id, username }, SECRET_KEY);
                resp.json({ id, username, token });
            });
        }

    });

    //    resp.end("not implented yet!");
})


var port = process.env.PORT || 900;
server.listen(port, () => {
    console.log("REST Endpoint Server at port" + port);
});