const express = require("express");
const session = require("express-session");
const port = 3000;
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcrypt");
const { nextTick } = require("process");


const app = express();

app.use(session({secret: "test-secret", saveUninitialized: true, resave: true}));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(session({secret: "randomsecret"}));

app.set("view engine", "hbs");

app.get("/", (req, res) => {
   res.render("index");
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let con;
    try {
        con = await pool.getConnection();

        let query = `select * from user where name = '${username}' limit 1`;
        let rows = await con.query(query);

        // Check if the user is in the database.
        if(rows.length > 0) {
            let hashedPw = rows[0]["password"];
            // Check if the password is correct.
            bcrypt.compare(password, hashedPw, (err, result) => {
                if(err) throw err;

                if(result) {
                    req.session.name = username;
                    res.send({"status": 0});
                }
                else {
                    res.send({"status": 1})
                }
            });
        }
        else {
            // User is not in the database.
            res.send({"status": 1});
        }
    }
    catch(err) {
        throw err;
    }
    finally {
        if(con) return con.release();
    }
});

app.post("/logout", (req, res) => {
    res.send("logout");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    
    const passwordHash = await hashPassword(password);
    console.log(passwordHash);
    

    const timestamp = Date.now();

    let con;
    try {
        con = await pool.getConnection();

        let query = `select name from user where name = '${username}' limit 1`;
        let rows = await con.query(query);

        if(rows.length > 0) {
            console.log(rows.length);
            res.send({"status": 1});
        }
        else {
            let insert = "insert into user values (?, ?, ?)";
            let tmp = await con.query(insert, [username, passwordHash, timestamp]);
            console.log(tmp);

            res.send({"status": 0});
        }
    }
    catch(err) {
        throw err;
    }
    finally {
        if(con) return con.release();
    }
});

app.get("/secret", (req, res) => {
    // This site is only available for logged in users.

    if(req.session.name == null || req.session.name === 0) {
        res.redirect("/");
    }
    else {
        
    }

    res.send("42");
});

app.listen(port, () => {
    console.log(`Listening to localhost on port: ${port}`);
});

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return hash;
}