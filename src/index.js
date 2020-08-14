const { ipcRenderer } = require('electron');
const tableBody = document.getElementById('tableBody');
const table = document.getElementById('mainTable');
const btnAdd = document.getElementById('btnAdd');

document.addEventListener("DOMContentLoaded", function() {
    ipcRenderer.send('get-all-passwords');
});

btnAdd.addEventListener('click',()=>{
    ipcRenderer.send('show-add-password-dialog');
})

ipcRenderer.on('all-passwords-result',(e, args)=>{
    console.log(args, typeof args);
    if(args.result === 1){
        renderPasswordsResult(args.args);
    } else {
        ipcRenderer.send('show-notification',{title:'Error!!!',body:args.args});
    }
})

function renderPasswordsResult(args) {
    args.forEach(p => {
        const tr = document.createElement('tr');
        const tdI = document.createElement('td');
        const tdW = document.createElement('td');
        const tdP = document.createElement('td');
        const tdB = document.createElement('td');
        const b = document.createElement('button');
        

        tdI.innerText = p.id;
        tdW.innerText = p.website;
        tdP.innerText = p.hashedpassword;
        b.innerText = 'Delete';

        b.setAttribute('onClick','deleteRow(this)');
        tdB.appendChild(b);

        tr.appendChild(tdI);
        tr.appendChild(tdW);
        tr.appendChild(tdP);
        tr.appendChild(tdB);

        tableBody.appendChild(tr);
    })
    if(tableBody.hasChildNodes()){
        table.style.display = 'block';
    }else{
        table.style.display = 'none';
    }
}

ipcRenderer.on('save-password-result',(e, args)=>{
    console.log(args, typeof args);
    if(args.result === 1){
        renderPasswordsResult([args.args])
    }else{
        ipcRenderer.send('show-notification',{title:'Error!!!',body:args.args});
    }
})

function deleteRow(btn) {
    console.log(btn);

    const id = btn.parentNode.parentNode.firstElementChild.innerText;
    ipcRenderer.send('delete-password',id);
}

ipcRenderer.on('delete-password-result',(e, args)=>{
    console.log(args, typeof args);
    if(args.result ===1){
        deletePasswordItem(args.args);
    } else {
        ipcRenderer.send('show-notification',{title:'Error!!!',body:args.args});
    }
});

function deletePasswordItem(params) {
    for(let i = 0;i < tableBody.rows.length;i++ ){
        const node = tableBody.rows[i];
        if(node.tagName === 'TR' && node.firstElementChild.innerText === String(params)){
            node.remove();
            break;
        }
    }
}
