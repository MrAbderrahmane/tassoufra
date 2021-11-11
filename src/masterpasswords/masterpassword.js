const { ipcRenderer } = require('electron');

const inputPassword = document.getElementById('inputPassword');
const pingBtn = document.querySelector('#confirm');
pingBtn.addEventListener('click',confirm);
function confirm(e){
    e.preventDefault();
    ipcRenderer.send('chck-mstr-psswrd',inputPassword.value);
}

ipcRenderer.on('error',(e, err) => {
    console.log(err);
});

ipcRenderer.on('show-notification',(e, args) => {
    console.log('show-notification: ', args);
    ipcRenderer.send("show-notification", {
        title: "Error!!!",
        body: args,
    });
});
