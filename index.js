const express = require("express");
const cors = require("cors");
const connection = require("./db_config");
const session = require('express-session');
const port = 9000;

const app = express();

const corsOptions = {
  origin: true,
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 365 * 1000 },
  })
);

app.use(express.json()).use(express.urlencoded({ extended: true }));

app.get("/events", (req, res) => {
  connection.query("SELECT * FROM events ", (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

app.post("/events", (req, res) => {
  const {
    artist_name,
    date,
    time,
    postal_code,
    city,
    location,
    name_place,
    style,
  } = req.body;
  connection.query(
    `INSERT INTO events (artist_name,
		date,
		time,
		postal_code,
		city,
		location,
		name_place,
		style) VALUES (?, ? ,?, ?, ?, ?, ?, ?)`,
    [artist_name, date, time, postal_code, city, location, name_place, style],
    (err) => {
      if (err) {
        res.status(500).send("Error saving the event " + err.message);
      } else {
        const posted = {
          artist_name,
          date,
          time,
          postal_code,
          city,
          location,
          name_place,
          style,
        };
        res.status(201).json(posted);
      }
    }
  );
});

// STYLES TABLE

// DISPLAY ELEMENTS IN STYLES TABLE

app.get("/styles", (req, res) => {
  connection.query("SELECT * FROM styles ", (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

// ADDING ELEMENTS IN STYLES TABLE

app.post("/styles", (req, res) => {
  const { name_style } = req.body;
  connection.query(`INSERT INTO styles (name_style) VALUES (?)`, [name_style], (err) => {
    if(err) {
      res.status(500).send("Error saving the event " + err.message);
    } else {
      const posted = { name_style };
      res.status(201).json(posted);
    }
  })
})

// ACCOUNT MEMBERS

app.get("/users", (req, res) => {
  connection.query("SELECT * FROM users ", (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

// CREATE AN USER

app.post('/users', (req, res) => {
  const { firstname, lastname, mail, password } = req.body;
  connection.query(
    `INSERT INTO users (firstname, lastname, mail, password) VALUES (?, ? ,?, ?)`,
    [firstname, lastname, mail, password],
    (err) => {
      if (err) {
        res.status(500).send('Error saving the user');
      } else {
        const posted = { firstname, lastname, mail, password };
        res.status(201).json(posted);
      }
    }
  );
});

// MODIF AN USER

app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, selectUser) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error');
      } else {
        const userFromDb = selectUser[0];
        if (userFromDb) {
          const userToUpdate = req.body;
          connection.query(
            'UPDATE users SET ? WHERE id = ?',
            [userToUpdate, userId],
            (error) => {
              if (error) {
                console.log(error);
                res.status(500).send('Error updating an user');
              } else {
                const updated = { ...userFromDb, ...userToUpdate };
                res.status(200).json(updated);
              }
            }
          );
        } else {
          res.status(404).send(`User with id ${userId} not found.`);
        }
      }
    }
  );
});

// DELETE AN USER

app.delete('/users/:id', (req, res) => {
  const usersId = req.params.id;
  connection.query(
    'DELETE FROM users WHERE id = ?',
    [usersId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error deleting an user');
      } else {
        const deleted = { usersId }
        res.status(200).send(deleted);
      }
    }
  );
});

// LOGIN

app.get('/login', (req, res) => {
  res.json(req.session.user);
});

app.post('/login', (req, res) => {
  req.session.user = req.body;
  req.session.save();
  res.json(req.session.user);
});

app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((error) => {
      res.redirect('/');
      if (error) {
        console.log(error);
      }
    });
  }
});

// LOCALHOST

app.listen(port, () => {
  console.log(`App server now listening to port ${port}`);
});
