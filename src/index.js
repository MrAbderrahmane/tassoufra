const { ipcRenderer } = require("electron");
const tableBody = document.getElementById("tableBody");
const table = document.getElementById("mainTable");
const btnAdd = document.getElementById("btnAdd");
let waitingForRawPassword = null;
const showDuration = 5000;

document.addEventListener("DOMContentLoaded", function () {
  ipcRenderer.send("get-all-passwords");
});

btnAdd.addEventListener("click", () => {
  ipcRenderer.send("show-add-password-dialog");
});

ipcRenderer.on("all-passwords-result", (e, args) => {
  console.log(args, typeof args);
  if (args.result === 1) {
    renderPasswordsResult(args.args);
  } else {
    ipcRenderer.send("show-notification", {
      title: "Error!!!",
      body: args.args,
    });
  }
});

const passwordBullets = "\u2022\u2022\u2022\u2022\u2022\u2022";
function renderPasswordsResult(args) {
  args.forEach((p) => {
    const tr = document.createElement("tr");
    const tdI = document.createElement("td");
    const tdW = document.createElement("td");
    const tdP = document.createElement("td");
    const bP = document.createElement("button");
    const tdB = document.createElement("td");
    const b = document.createElement("button");
    const icon = document.createElement("img");
    icon.src = "../assets/images/visibility.svg";
    icon.style.width = "17px";
    bP.appendChild(icon);
    bP.setAttribute("onClick", "showPassword(this)");

    tdI.innerText = p.id;
    tdW.innerText = p.website;
    tdP.innerText = passwordBullets;
    tdP.hashedpassword = p.hashedpassword;
    tdP.appendChild(bP);
    b.innerText = "Delete";

    b.setAttribute("onClick", "deleteRow(this)");
    tdB.appendChild(b);

    tr.appendChild(tdI);
    tr.appendChild(tdW);
    tr.appendChild(tdP);
    tr.appendChild(tdB);

    tableBody.appendChild(tr);
  });
  if (tableBody.hasChildNodes()) {
    table.style.display = "block";
  } else {
    table.style.display = "none";
  }
}

ipcRenderer.on("save-password-result", (e, args) => {
  console.log(args, typeof args);
  if (args.result === 1) {
    renderPasswordsResult([args.args]);
  } else {
    ipcRenderer.send("show-notification", {
      title: "Error!!!",
      body: args.args,
    });
  }
});

function deleteRow(btn) {
  console.log(btn);

  const id = btn.parentNode.parentNode.firstElementChild.innerText;
  ipcRenderer.send("delete-password", id);
}

function showPassword(btn) {
  if (waitingForRawPassword === null) {
    const hashedPassword = btn.parentNode.hashedpassword;
    ipcRenderer.send("show-password", hashedPassword);
    waitingForRawPassword = btn.parentNode;
  }
}

ipcRenderer.on("showed-password", (e, args) => {
  if (waitingForRawPassword && args && args.result === 1) {
    const btn = waitingForRawPassword.querySelector("button");
    btn && (btn.style.display = "none");
    for (let node of waitingForRawPassword.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = args.args;
        break;
      }
    }
    const w = waitingForRawPassword;
    setTimeout(() => {
      for (let node of w.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = passwordBullets;
          btn && (btn.style.display = "inline-block");
          break;
        }
      }
    }, showDuration);
    waitingForRawPassword = null;
  } else {
    // ! todo
  }
});

ipcRenderer.on("delete-password-result", (e, args) => {
  console.log(args, typeof args);
  if (args.result === 1) {
    deletePasswordItem(args.args);
  } else {
    ipcRenderer.send("show-notification", {
      title: "Error!!!",
      body: args.args,
    });
  }
});

function deletePasswordItem(params) {
  for (let i = 0; i < tableBody.rows.length; i++) {
    const node = tableBody.rows[i];
    if (
      node.tagName === "TR" &&
      node.firstElementChild.innerText === String(params)
    ) {
      node.remove();
      break;
    }
  }
}
