const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

const users = [];

const JWT_SECRET = "PRAVEEN_APP";

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", function (req, res) {
  res.sendFile("./frontend/index.html");
});

app.post("/signup", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const foundUser = users.find((u) => u.username == username);
  if (foundUser) {
    res.status(403).send({
      message: "You already have account,Please SignIn",
    });
  } else {
    users.push({
      username,
      password,
    });

    res.send({
      message: "You have Signed Up",
    });
  }
});

app.post("/signin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = users.find(
    (user) => user.username == username && user.password == password
  );

  if (user) {
    const token = jwt.sign(
      {
        username: user.username,
        password: user.password,
      },
      JWT_SECRET
    );
    user.token = token;
    res.send({
      token,
    });
  } else {
    res.status(403).send({
      message: "Invalid username or password",
    });
  }
});

app.get("/me", (req, res) => {
  const token = req.headers.authorization;
  const userDetails = jwt.verify(token, JWT_SECRET);

  const username = userDetails.username;

  const user = users.find((u) => u.username == username);

  if (user) {
    res.send({
      username: user.username,
      password: user.password,
    });
  } else {
    res.send(401).send({
      message: "Unauthorized",
    });
  }
});

app.get("/todos", function (req, res) {
  fs.readFile("backend/user.json", "utf-8", function (err, data) {
    if (err) {
      console.log("Error reading file", err);
    }

    try {
      const contents = JSON.parse(data);

      const ToDos = [];

      for (let i = 0; i < contents.length; i++) {
        ToDos.push({
          id: contents[i].id,
          description: contents[i].description,
        });
      }
      res.json({ ToDos });
    } catch (err) {
      console.log("Error in parsing", err);
    }
  });
});

app.get("/todos/:id", function (req, res) {
  const id = +req.params.id;

  fs.readFile("backend/user.json", "utf-8", function (err, data) {
    const contents = JSON.parse(data);
    let todo = [];

    for (let i = 0; i < contents.length; i++) {
      const todoId = contents[i].id;
      if (id == todoId) {
        todo.push(contents[i].description);
        break;
      }
    }
    res.status(200).json({ todo });
  });
});

app.post("/todos", function (req, res) {
  fs.readFile("backend/user.json", "utf-8", function (err, data) {
    const count = JSON.parse(data).length;
    const existingData = JSON.parse(data);
    const input = req.body;
    const updatedInput = { id: Math.floor(Math.random() * 100), ...input };
    console.log(updatedInput);
    existingData.push(updatedInput);
    const finalData = JSON.stringify(existingData, null, 2);
    fs.writeFile("backend/user.json", finalData, (err) => {
      if (err) {
        console.log("Error in writing to file");
      }
      res.json({ id: updatedInput.id, msg: "Added the todo" });
    });
  });
});

app.put("/todos/:id", function (req, res) {
  const id = +req.params.id;
  fs.readFile("backend/user.json", "utf-8", function (err, data) {
    if (err) {
      console.log("Error in reading the file");
    } else {
      const contents = JSON.parse(data);
      const updatedTodo = req.body;
      const todoToUpdate = contents.find((item) => item.id == id);
      todoToUpdate.todo.description = updatedTodo.description;
      const newData = JSON.stringify(contents, null, 2);

      fs.writeFile("backend/user.json", newData, function (err, data) {
        if (err) {
          console.log("Error in writing to file");
        } else {
          res.json({ msg: "Updated the todo" });
        }
      });
    }
  });
});

app.delete("/todos/:id", function (req, res) {
  const id = req.params.id;

  fs.readFile("backend/user.json", "utf-8", function (err, data) {
    const contents = JSON.parse(data);
    for (let i = 0; i < contents.length; i++) {
      if (contents[i].id == id) {
        contents.splice(i, 1);
        break;
      }
    }
    const updatedData = JSON.stringify(contents, null, 2);
    fs.writeFile("backend/user.json", updatedData, function (err, data) {
      if (err) {
        console.log("Error in writing to file");
      } else {
        res.json({ msg: "Deleted the todo" });
      }
    });
  });
});

app.listen(3000);
