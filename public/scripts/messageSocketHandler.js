    console.log("wokring");

    // import ApiRequest from "../../models/ApiRequest";

    class ApiRequest {
        static requestColor = () => {
            let hex = getRandomHex();
            return fetch(`https://www.thecolorapi.com/id?hex=${hex}&format=json`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(response => response.json());
        }

        static requestName = () => {
            return fetch('https://randommer.io/api/Name?nameType=firstname&quantity=1',{
                method: "GET",
                headers: {
                    "X-Api-Key": "06740e2146ad4bfdaa9bc239ea906140",
                },
            }).then(response => response.json());
        }
    }

    /**
     * Copied/modified from https://thecolorapi.com
     *  
     *   */
    function getRandomHex() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '';
        for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }


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

    socket.on('user.connected', (db) =>{//once connection is received from server
        //it sets user name
        ApiRequest.requestColor().then(json => { //by fetching random color from API
            console.log(json.name.value);
            let color = json.name.value;
            console.log(color);
            ApiRequest.requestName().then(json => { //by fetching random name from API
                console.log(json[0]);
                let name = json[0];
                let userName = `${color} ${name}`   //putting both fetches together
                // sets name on page
                var item = document.createElement('li');
                item.textContent = `You are connected as ${userName}`;
                // TODO here it needs to save into jwt info like; socket.id, userName, color hexcode
                messages.appendChild(item);
                window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
                socket.emit('new user', userName); //sends message to server that name has been establish
            })

        })
    })

    socket.on('new user', function (userName) {
        console.log(userName);
        var item = document.createElement('li');
        item.textContent = `${userName} has connected`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
    })

    socket.on('chat message', function (msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
    })