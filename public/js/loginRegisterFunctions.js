function addUser(e) {
    // try {
    const name = $('#name').val()
    const email = $('#email').val()
    const password = $('#password').val()
    const confirmPassword = $('#confirmPassword').val()
    if(!name || !email || !password || !confirmPassword){
        Swal.fire("All field must be filled!");
    }else{
        if (password != confirmPassword) {
            Swal.fire("Password doesn't match!");
            return
        }
        const data = {
            name,
            email,
            password,
            role: 'user',
            creditBioLink: 0,
            creditShortUrl: 0,
            creditQr: 0,
            creditPrompt: 0,
            createdAt: new Date()
        }
        fetchAPI('/credential/register', 'POST', data, 'This Email is Already Taken!', '/login')
    }
}

function login(e) {
    const email = $('#email').val()
    const password = $('#password').val()
    if(!email || !password){
        Swal.fire("All field must be filled!");
    }else{
        const data = {
            email,
            password
        }
        var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
        if(data){
            config.body = JSON.stringify(data)
        }
        fetch('/credential/login', config).then(async (response) => {
            if (response.ok) {
                const resp = await response.json()
                var loc = '/'
                if(resp.text == 'admin') loc = '/admin'
                window.location.href = loc
            }
            else if(response.status){
                var text = 'Email or Password is incorect!'
                if(response.status == 403) text ='Your account is banned please ask admin to unbanned'
                Swal.fire({
                icon: "error",
                title: "Ooops....",
                text,
                });
            }
            else{
            }
        }).catch((error) => {
            alert('WARNING!')
            console.log(error);
        });
    }
}

function signOut(e) {  
    fetchAPI('/credential/logout', 'POST', null, '', '/login')
}

function fetchAPI(apiUrl, method, data, text, destination){
    var config = {method, headers: {"Content-Type": "application/json"}}
    if(data){
        config.body = JSON.stringify(data)
    }
    fetch(apiUrl, config).then(async (response) => {
        if (response.ok) {
            window.location.href = destination;
        }
        else if(response.status){
            console.log(response.status);
            Swal.fire({
            icon: "error",
            title: "Ooops....",
            text,
            });
        }
        else{
        }
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
}