const { ipcRenderer } = require("electron");
const tableBody = document.getElementById("tableBody");
const table = document.getElementById("mainTable");
const btnAdd = document.getElementById("btnAdd");
const filterInput = document.querySelector('#filterInput');
let waitingForRawPassword = null;
const showDuration = 5000;

document.addEventListener("DOMContentLoaded", function () {
  ipcRenderer.send("show-master-password-dialog");
});

filterInput.addEventListener("keyup", filter);

ipcRenderer.on("master-password-set",async (e, args)=>{
  const res = await ipcRenderer.invoke("get-all-passwords");
  renderAllPasswords(res);
})

ipcRenderer.on("rerender", async (e, arg)=>{
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.lastChild);
  }
  const res = await ipcRenderer.invoke("get-all-passwords");
  renderAllPasswords(res);
})

btnAdd.addEventListener("click", () => {
  ipcRenderer.send("show-add-password-dialog");
});

// ipcRenderer.on("all-passwords-result", (e, args) => {
function renderAllPasswords(args) {
  // console.log(args, typeof args);
  if (args.result === 1) {
    renderPasswordsResult(args.args);
  } else {
    ipcRenderer.send("show-notification", {
      title: "Error!!!",
      body: args.args,
    });
  }
};

const passwordBullets = "\u2022\u2022\u2022\u2022\u2022\u2022";
function renderPasswordsResult(args) {
  args.forEach((p) => {
    const tr = document.createElement("tr");
    const tdI = document.createElement("td");
    const tdW = document.createElement("td");
    const tdU = document.createElement("td");
    const tdP = document.createElement("td");
    const bP = document.createElement("button");
    const bPC = document.createElement("button");
    const tdB = document.createElement("td");
    const b = document.createElement("button");
    const bEdit = document.createElement("button");
    bP.textContent = "Show";
    bP.classList.add('with-icon',"eye");
    bP.setAttribute("onClick", "showPassword(this)");

    bPC.classList.add('with-icon',"copy");
    bPC.textContent = "Copy"
    bPC.setAttribute("onClick", "copyPassword(this)");
    bPC.style.display = "none";

    tdI.innerText = p.id;
    tdW.innerText = p.website;
    tdU.innerText = p.username;
    tdP.innerText = passwordBullets;
    tdP.hashedpassword = p.hashedpassword;
    tdP.appendChild(bP);
    tdP.appendChild(bPC);
    b.innerText = "Delete";
    b.classList.add('with-icon','trash');
    b.setAttribute("onClick", "deleteRow(event)");
    // b.setAttribute("type","button");
    tdB.appendChild(b);

    bEdit.innerText = "Edit";
    bEdit.classList.add('with-icon','edit');
    bEdit.setAttribute("onClick", "editRow(this)");
    tdB.appendChild(bEdit);

    tr.appendChild(tdI);
    tr.appendChild(tdW);
    tr.appendChild(tdU);
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

async function deleteRow(e) {
  const btn = e.currentTarget;
  // e.preventDefault();
  // e.stopPropagation();
  const id = btn.parentNode.parentNode.firstElementChild.innerText;
  // const res = await 
  ipcRenderer.invoke("delete-password", id).then(res => {
    console.log(res)
    deletePasswordHandler({result:1,args:id});
  });
  console.log('delete row')
  // deletePasswordHandler(res);
  // deletePasswordHandler({result:1,args:id});
  // return false;
}

function editRow(btn) {
  const id = btn.parentNode.parentNode.firstElementChild.innerText;
  ipcRenderer.send("edit-password", id);
}

async function showPassword(btn) {
  if (waitingForRawPassword === null) {
    const hashedPassword = btn.parentNode.hashedpassword;
    waitingForRawPassword = btn.parentNode;
    const arg = await ipcRenderer.invoke("show-password", hashedPassword);
    showPasswordHandler(arg);
  }
}
function copyPassword(btn){
  for (let node of btn.parentNode.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if(!node.textContent.startsWith('\u2022')){
        ipcRenderer.send('copy-to-clipboard', node.textContent)
      }
      break;
    }
  }
}

/// ipcRenderer.on("showed-password", (e, args) => {
function showPasswordHandler(args) {
  if (waitingForRawPassword && args && args.result === 1) {
    const [btn,btnCopy] = waitingForRawPassword.querySelectorAll("button");
    btn && (btn.style.display = "none");
    btnCopy && (btnCopy.style.display = "inline-block")
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
          btnCopy && (btnCopy.style.display = "none")
          break;
        }
      }
    }, showDuration);
    waitingForRawPassword = null;
  } else {
    // ! todo
  }
}

// ipcRenderer.on("delete-password-result", (e, args) => {
function deletePasswordHandler(args){
  console.log(args, typeof args);
  if (args.result === 1) {
    deletePasswordItem(args.args);
  } else {
    ipcRenderer.send("show-notification", {
      title: "Error!!!",
      body: args.args,
    });
  }
};

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

ipcRenderer.on('test',console.log);

ipcRenderer.on('test-child',(e,args)=>{
  console.log(args);
  e.sender.send('test-child', 'received msg');
});

function filter(e){
  console.log(e);
  const value = e.target.value;
  console.log(value);
  search(value);
}

function search(value){
  tableBody.childNodes.forEach(node => {
    if(node.nodeName === "TR"){
      let found = false;
      for(let i = 0; i<node.childNodes.length -1; i++){
        const currentNode = node.childNodes[i];
        if (i>2) break;
        if(currentNode.textContent.includes(value)) {
          found = true;
          break;
        };
      }
      if(!found) node.style.display = 'none';
      else node.style.display = 'table-row';
    }
  });
}