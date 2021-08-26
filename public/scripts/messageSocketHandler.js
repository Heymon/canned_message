    console.log("wokring");
    var socket = io();
        
    var messages = document.getElementById('messages');
    console.log(messages);
    var form = document.getElementById('form');
    console.log(form);
    var input = document.getElementById('input');
    console.log(input);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if(input.value){
            socket.emit('chat message', input.value);
            input.value = '';
        } 
    });

    socket.on('chat message', function (msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
    })