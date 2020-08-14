const { ipcRenderer } = require('electron');

const add = document.getElementById('add');
const inputWebsite = document.getElementById('inputWebsite');
const inputPassword = document.getElementById('inputPassword');


add.addEventListener('click',()=>{
    console.log('add button')
    const website = inputWebsite.value;
    const password = inputPassword.value;

    ipcRenderer.send('save-password',{website,password});

})
