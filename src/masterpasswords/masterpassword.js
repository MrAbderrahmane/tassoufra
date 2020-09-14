const { ipcRenderer } = require('electron');

const confirm = document.getElementById('confirm');
const inputPassword = document.getElementById('inputPassword');


confirm.addEventListener('click',()=>{
    console.log('add button');
    // log('oij');
    const password = inputPassword.value;
    ipcRenderer.send('check-master-password',password);
});


ipcRenderer.on('error',(e, err) => {
    console.log(err);
    // show error msg
});

ipcRenderer.on('wrong-master-password',(e, args) => {
    console.log('wrong master password');
    log(args)

    // show error msg
});

function log(arg) {
    const r = document.createElement('p')
    r.innerText = arg
    document.body.appendChild(r)
}