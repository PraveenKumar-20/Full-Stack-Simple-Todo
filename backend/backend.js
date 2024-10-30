const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const app = express();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { auth, JWT_SECRET } = require("./auth");
app.use(express.json());

const { UserModel, TodoModel } = require("./db");
const { default: mongoose } = require("mongoose");

mongoose.connect(
  "mongodb+srv://kumarpraveen8464:SN589zMUOmxJmuQn@cluster0.qlst3.mongodb.net/todo-data-base"
);

const users = [];

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", function (req, res) {
  res.sendFile("./frontend/index.html");
});

app.post("/signup", async function (req, res) {
  const reqBody = z.object({
    username: z.string().min(3).max(50).email(),
    password: z
      .string()
      .min(6)
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password Required atleast one uppercase character",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Password Required atleast one lowercase character",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password Required atleast one number",
      })
      .refine((password) => /[!@#$%^&*]/.test(password), {
        message: "Password Required atleast one special character",
      }),
  });

  const parsedData = reqBody.safeParse(req.body);

  if (!parsedData.success) {
    res.send({
      message: "Incorrect format",
      error: parsedData.error,
    });
    return;
  }
  const username = req.body.username;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  // const foundUser = users.find((u) => u.username == username);

  const foundUser = await UserModel.findOne({
    email: username,
  });

  if (foundUser) {
    res.status(403).send({
      message: "You already have account,Please SignIn",
    });
  } else {
    // users.push({
    //   username,
    //   password,
    // });

    await UserModel.create({
      email: username,
      password: hashedPassword,
    });

    res.send({
      message: "You have Signed Up",
    });
  }
});

app.post("/signin", async function (req, res) {
  const reqBody = z.object({
    username: z.string().min(3).max(50).email(),
    password: z
      .string()
      .min(6)
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password Required atleast one uppercase character",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Password Required atleast one lowercase character",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password Required atleast one number",
      })
      .refine((password) => /[!@#$%^&*]/.test(password), {
        message: "Password Required atleast one special character",
      }),
  });

  const parsedData = reqBody.safeParse(req.body);

  if (!parsedData.success) {
    res.status(403).send({
      message: parsedData.error,
    });
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  // const user = users.find(
  //   (user) => user.username == username && user.password == password
  // );

  const user = await UserModel.findOne({
    email: username,
  });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET
    );

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

app.get("/todos", auth, async function (req, res) {
  // fs.readFile("backend/user.json", "utf-8", function (err, data) {
  //   if (err) {
  //     console.log("Error reading file", err);
  //   }
  //   try {
  //     const contents = JSON.parse(data);
  //     const ToDos = [];
  //     for (let i = 0; i < contents.length; i++) {
  //       ToDos.push({
  //         id: contents[i].id,
  //         description: contents[i].description,
  //       });
  //     }
  //     res.json({ ToDos });
  //   } catch (err) {
  //     console.log("Error in parsing", err);
  //   }
  // });

  try {
    const todos = await TodoModel.find({
      userId: req.userId.id,
    });
    res.json({
      todos,
    });
  } catch (err) {
    res.send({
      message: err,
    });
  }
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

app.post("/todos", async function (req, res) {
  // fs.readFile("backend/user.json", "utf-8", function (err, data) {
  //   const count = JSON.parse(data).length;
  //   const existingData = JSON.parse(data);
  //   const input = req.body;
  //   const updatedInput = { id: Math.floor(Math.random() * 100), ...input };
  //   console.log(updatedInput);
  //   existingData.push(updatedInput);
  //   const finalData = JSON.stringify(existingData, null, 2);
  //   fs.writeFile("backend/user.json", finalData, (err) => {
  //     if (err) {
  //       console.log("Error in writing to file");
  //     }
  //     res.json({ id: updatedInput.id, msg: "Added the todo" });
  //   });
  // });

  const AddTodo = req.body.description;
  const idd = jwt.decode(req.headers.token);
  const uniqId = idd.id;

  try {
    await TodoModel.create({
      description: AddTodo,
      userId: new mongoose.Types.ObjectId(uniqId),
    });

    res.json({
      id: uniqId + Math.floor(Math.random() * 100),
      description: AddTodo,
    });
  } catch (err) {
    console.log(err);
    res.status(403).send({
      message: err,
    });
  }
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

app.delete("/todos/:id", async function (req, res) {
  const id = req.params.id;

  // fs.readFile("backend/user.json", "utf-8", function (err, data) {
  //   const contents = JSON.parse(data);
  //   for (let i = 0; i < contents.length; i++) {
  //     if (contents[i].id == id) {
  //       contents.splice(i, 1);
  //       break;
  //     }
  //   }
  //   const updatedData = JSON.stringify(contents, null, 2);
  //   fs.writeFile("backend/user.json", updatedData, function (err, data) {
  //     if (err) {
  //       console.log("Error in writing to file");
  //     } else {
  //       res.json({ msg: "Deleted the todo" });
  //     }
  //   });
  // });
  const user = jwt.decode(req.headers.token);

  try {
    const deletedTodo = await TodoModel.deleteOne({
      userId: user.id,
      description: req.body.Text,
    });

    res.send({
      message: `Delete ${deletedTodo} Todo`,
    });
  } catch (err) {
    res.status(403).send({
      message: err,
    });
  }
});

app.listen(3000);
