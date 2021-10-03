    console.log("wokring");

    // import ApiRequest from "../../models/ApiRequest";

    class ApiRequest {
        static requestColor = () => {
            let hex = "";
            let isContrastGood = false;
            while (!isContrastGood) {
                hex = getRandomHex();
                let contrast = contrastRatio(hexToRgb(hex), [250,235,215]);
                let contrast2 = contrastRatio(hexToRgb(hex), [255,218,168]);
                if (contrast > 4.5 && contrast2 > 4.5) {
                    isContrastGood = true
                }
                
            }
            return fetch(`https://www.thecolorapi.com/id?hex=${hex}&format=json`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(response => response.json());
        }

        static requestName = (apiKey) => {
            return fetch('https://randommer.io/api/Name?nameType=firstname&quantity=1',{
                method: "GET",
                headers: {
                    "X-Api-Key": apiKey,
                },
            }).then(response => response.json());
        }
    }

    const baseURL = "https://canned-message.herokuapp.com";

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

    /** 
     * Copied/modified from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * 
     */
    function hexToRgb(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
    
        return [r, g, b];
    }

    const contrastRatio = (colorOne, colorTwo) =>{//lighter color(closest to 1) divided by dacker(closest to 0) color according to https://www.accessibility-developer-guide.com/knowledge/colours-and-contrast/how-to-calculate/

        let l1 = relativeLuminance(colorOne);
        let l2 = relativeLuminance(colorTwo);

        if (l1 < l2) {
            return (l2+0.05)/(l1+0.05)           
        }else {
            return (l1+0.05)/(l2+0.05)
        }
        
    }

    const relativeLuminance = (color) =>{//formula from https://www.w3.org/WAI/GL/wiki/Relative_luminance

        let realRGB = [];
        
        for (let i = 0; i < 3; i++) {
            let sRGB = color[i]/255;
            if (sRGB <= 0.04045) {
                realRGB.push(sRGB/12.92);
            }else {
                realRGB.push(Math.pow((sRGB+0.055)/1.055, 2.4));
            }
        }
        return (0.2126*realRGB[0])+(0.7152*realRGB[1])+(0.0722*realRGB[2])

    }

    const addMessage = (msg, userInfo, isUser, isPrepend) => {
        const lastMessage = messages.lastElementChild;
        // sets name on page
        let item = document.createElement('li');
        let subItem = document.createElement('span');
        subItem.textContent = `${userInfo.userName}`;
        subItem.style.color = userInfo.colorHex;
        item.textContent = msg;

        if (!isPrepend) {
            if(isUser){
                item.setAttribute("class", "user--message");
                if (lastMessage.className === "user--message" && lastMessage.children[0].textContent === userInfo.userName) {
                    // lastMessage.textContent = `${lastMessage.childNodes[0].textContent}\n${msg}`; 
                    lastMessage.insertBefore(document.createTextNode(`\n${msg}`), lastMessage.children[0]);
                    return
                }
            }
            item.appendChild(subItem);
            messages.appendChild(item);
        } else {
            item.prepend(subItem);
            messages.appendChild(item);
        } 
        messages.scrollTo(0, messages.scrollHeight);//keeps page at the bottom
    }

    const updateUsersList = (userInfo, isConnecting) => {

        if (isConnecting) {
            console.log("user connected " + userInfo.userName);
            const item = document.createElement('li');
            item.textContent = userInfo.userName;
            item.style.color = userInfo.colorHex;
            usersList.appendChild(item);//add the user to the list of online users on client
        } else {
            console.log("user disconnected " + userInfo.userName);
            const onlineUsers = document.getElementById('online--users').children;
            console.log(onlineUsers);
            for (let index = 0; index < onlineUsers.length; index++) {
                if (onlineUsers[index].textContent === userInfo.userName) {
                    onlineUsers[index].remove();
                    break;
                }
            }
        }
    }

    const fixInputHeight = (inputEl) =>{
        inputEl.setAttribute("style", 'height:auto');
        inputEl.setAttribute("style", `height:${inputEl.scrollHeight-5}px`);//-6 because of padding and margin
    }


    let socket = io();
        
    const messages = document.getElementById('messages');
    console.log(messages);
    const form = document.getElementById('form');
    console.log(form);
    const input = document.getElementById('input');
    console.log(input);
    const usersList = document.getElementById('online--users');
    console.log(usersList);

    input.addEventListener('input', (e) => {//automatically adjust height after new input
        fixInputHeight(e.target);
    })

    input.addEventListener('keypress', (e) =>{//makes enter on textarea submit & enter+shift new linex
        if (e.shiftKey && e.key === 'Enter') {
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            console.log(e.key)
            // e.target.form.dispatchEvent(new Event('input', {cancelable: true})); 
            e.target.form.dispatchEvent(new Event('submit', {cancelable: true}))
            fixInputHeight(e.target);
            
            
        }
    })

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if(input.value){
            if(localStorage.uif){
                // let userMsg = {msg: input.value, userInfo:{...JSON.parse(localStorage.uif)}};
                // console.log(userMsg);
                socket.emit('chat message', {msg: input.value});
                input.value = '';
            }
        } 
    });

    socket.on('user.connected', (serverData) =>{//once connection is received from server
        console.log(serverData);

        //display online current users
        serverData.usersList.forEach((curValue) => {
            updateUsersList({userName: curValue.userName, colorHex: curValue.colorHex}, true);
        });

        // TODO create function to check if the name is a duplicate
        //it sets user name
        ApiRequest.requestColor().then(json => { //by fetching random color from API
            console.log(json.name.value);
            let colorName = json.name.value;
            let colorHex = json.hex.value;
            console.log(serverData.nameApiKey);
            ApiRequest.requestName(serverData.nameApiKey).then(json => { //by fetching random name from API
                console.log(json[0]);
                let name = json[0];
                let userName = `${colorName} ${name}`   //putting both fetches together
                let userInfo = {colorHex, userName : userName}
                //it saves info into jwt and local storage; info like: socket.id, userName, color hexcode
                localStorage.setItem("uif", JSON.stringify(userInfo));//saves a cookie with accessible info
                AuthModel.register({socketId : serverData.socketId, ...userInfo}).then( json => {
                    console.log(json);
                    localStorage.setItem("uid", JSON.stringify(json.signedJwt));//sets the jwt
                    console.log(JSON.parse(localStorage.uif));       
                    
                    // sets name on page
                    addMessage('You are connected as ', {userName, colorHex}, false)
                    socket.emit('new user', userInfo); //sends message to server that name has been establish
                })
            })

        })
    })

    socket.on('user.disconnected', function (userInfo) {
        updateUsersList(userInfo, false);
        addMessage(' has disconnected', userInfo, false, true);  
    })

    socket.on('new user', function (userInfo) {
        // console.log(userInfo);
        //display on DOM new user connected
        addMessage(' has connected', userInfo, false, true);
        updateUsersList(userInfo, true);
    })

    socket.on('chat message', function (userMsg) {
        //adds new message to DOM
        addMessage(userMsg.msg, userMsg.userInfo, true, false)
    })