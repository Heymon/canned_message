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
                    "X-Api-Key": "06740e2146ad4bfdaa9bc239ea906140",// needs to be reseted because it is already saved in git
                },
            }).then(response => response.json());
        }
    }

    const baseURL = "http://localhost:3000";

    class AuthModel {
        static register = data => {
            return fetch (`${baseURL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
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
            if(localStorage.uif){
                let userInfo = {msg: input.value, ...JSON.parse(localStorage.uif)};
                console.log(userInfo);
                socket.emit('chat message', userInfo);
                input.value = '';
            }
        } 
    });

    socket.on('user.connected', (id) =>{//once connection is received from server
        console.log(id);
        //it sets user name
        ApiRequest.requestColor().then(json => { //by fetching random color from API
            console.log(json.name.value);
            let colorName = json.name.value;
            let colorHex = json.hex.value;
            ApiRequest.requestName().then(json => { //by fetching random name from API
                console.log(json[0]);
                let name = json[0];
                let userName = `${colorName} ${name}`   //putting both fetches together
                let userInfo = {hexCode : colorHex, userName : userName}
                //it saves info into jwt and local storage; info like: socket.id, userName, color hexcode
                localStorage.setItem("uif", JSON.stringify(userInfo));//saves a cookie with accessible info
                AuthModel.register({socketId : id.socketId, ...userInfo}).then( json => {
                    console.log(json);
                    localStorage.setItem("uid", JSON.stringify(json.signedJwt));//sets the jwt
                    console.log(JSON.parse(localStorage.uif));       
                    
                    // sets name on page
                    let item = document.createElement('li');
                    let subItem = document.createElement('span');
                    subItem.textContent = `${userName}`;
                    subItem.style.color = colorHex;
                    item.textContent = 'You are connected as ';
                    item.appendChild(subItem);
                    messages.appendChild(item);
                    window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
                    socket.emit('new user', userInfo); //sends message to server that name has been establish
                })
            })

        })
    })

    socket.on('new user', function (userInfo) {
        console.log(userInfo);
        //sends hex color and user name to other sockets
        let item = document.createElement('li');
        let subItem = document.createElement('span');
        subItem.textContent = `${userInfo.userName}`;
        subItem.style.color = userInfo.hexCode;
        item.textContent = ' has connected';
        item.prepend(subItem);
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
    })

    socket.on('chat message', function (userMsg) {
        let item = document.createElement('li');
        let subItem = document.createElement('span');
        subItem.textContent = `-${userMsg.userName}`;
        subItem.style.color = userMsg.hexCode;
        item.textContent = userMsg.msg;
        item.appendChild(subItem);
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);//keeps page at the bottom
    })