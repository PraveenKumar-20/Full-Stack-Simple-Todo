function newElement(todo, uniqueId) {
  const divTodotext = document.createElement("div");
  divTodotext.classList.add("todotext");
  const divTodolist = document.querySelector(".lists");
  divTodolist.appendChild(divTodotext);

  const spanTag = document.createElement("span");
  divTodotext.appendChild(spanTag);

  const buttonTag = document.createElement("button");
  divTodotext.appendChild(buttonTag);

  spanTag.setAttribute("style", "font-weight: 549");
  spanTag.innerHTML = todo;
  buttonTag.classList.add("delete");

  // spanTag.innerHTML = todo;
  // const base = Date.now() % 100000;
  // const random = Math.floor(Math.random() * 100000);
  // const idNumber = (base + random) % 100000;
  buttonTag.setAttribute("id", uniqueId);
  buttonTag.setAttribute("onclick", "handleDelete(this.id)");
  buttonTag.innerHTML = "Delete";
}

async function handleDelete(id) {
  await axios.delete(`http://localhost:3000/todos/${id}`);

  const button = document.getElementById(id);

  if (button) {
    button.parentElement.remove();
  }
}

async function handleAddToDo() {
  const Todo = document.querySelector(".todolist1").value;

  const response = await axios.post("http://localhost:3000/todos", {
    description: Todo,
  });
  const uniqueId = response.data.id;

  const response1 = await axios.get(
    `http://localhost:3000/todos/${response.data.id}`
  );

  newElement(response1.data.todo[0], uniqueId);

  document.querySelector(".todolist1").value = "";
}

async function handleSignUp() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("http://localhost:3000/signup", {
      username: username,
      password: password,
    });
    alert("Signed Up successfully");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  } catch (err) {
    alert("You already have account,Please SignIn");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }
}

async function handleSignIn() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("http://localhost:3000/signin", {
      username: username,
      password: password,
    });

    localStorage.setItem("token", response.data.token);
    alert("Signed In Successfully");
    const LoginContainer = document.getElementById("container");
    const todoContainer = document.getElementById("main");

    LoginContainer.classList.add("hidden");
    todoContainer.classList.remove("hidden");
  } catch (err) {
    alert("Invalid Username or Password");
  }

  try {
    const response = await axios.get("http://localhost:3000/todos");
    const todos = response.data.ToDos;
    for (let i = 0; i < todos.length; i++) {
      newElement(todos[i].description, todos[i].id);
    }
  } catch (error) {
    console.log(error);
  }
}

window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.handleAddToDo = handleAddToDo;
window.handleDelete = handleDelete;
