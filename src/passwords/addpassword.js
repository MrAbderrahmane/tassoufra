const { ipcRenderer, remote, powerSaveBlocker } = require('electron');

let passwordToBeEdited;

const add = document.getElementById('add');
const inputWebsite = document.getElementById('inputWebsite');
const inputUsername = document.getElementById('inputUsername');
const inputPassword = document.getElementById('inputPassword');

document.addEventListener("DOMContentLoaded", function () {
    passwordToBeEdited = remote.getCurrentWindow().password
    if(passwordToBeEdited){
        switchToEdit(passwordToBeEdited);
    }
});

function switchToEdit(password){
    inputWebsite.value = password.website;
    inputUsername.value = password.username;
    inputPassword.placeholder = "Type new password";
    add.textContent = "edit"
}

add.addEventListener('click',(e)=>{
    e.preventDefault();
    console.log('add button')
    const website = inputWebsite.value;
    const password = inputPassword.value;
    const username = inputUsername.value;

    if(passwordToBeEdited){
        const obj = {
            id: passwordToBeEdited.id,
            ...(passwordToBeEdited.website !== website? {website}: {}),
            ...(passwordToBeEdited.username !== username? {username}: {}),
            ...(password !== ""? {password}:{})
        }
        if(Object.keys(obj).length > 1){
            ipcRenderer.send('update-password', obj);        
        }
    } else {
        ipcRenderer.send('save-password',{website,username,password});
    }

});
