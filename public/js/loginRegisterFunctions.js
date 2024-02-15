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
            credit: 0,
            role: 'user',
        }
        fetchAPI('/credential/register', 'POST', data, 'This Email is Already Taken!', '/login')
    }
}

function login(e) {
    const email = $('#email').val()
    const password = $('#password').val()
    if(!email || !password){
        Swal.fire("All field must be filled peko!");
    }else{
        const data = {
            email,
            password
        }
        fetchAPI('/credential/login', 'POST', data, 'Email or Password is incorect!', '/')
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