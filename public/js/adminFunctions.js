function btnActionUser(e) {  
    const email = $(e).val()
    const type = $(e).attr('typeBan')
    const ban = type == 'banned' ? 1 : -1
    const data = {email, ban}
    var title = "Are you sure you want to "+ type + ' ' + email + " ?"
    Swal.fire({
        icon: "warning",
        title,
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            fetchAPI('/credential/updateUser', 'POST', data, "Something wrong while updating this user's data", '?')
        } else if (result.isDenied) {
          return
        }
    });
    
}

function addUser(e) {
    // try {
    const name = $('#name').val()
    const email = $('#email').val()
    const password = $('#password').val()
    const confirmPassword = $('#confirmPassword').val()
    if(!name || !email || !password || !confirmPassword){
        Swal.fire("All field must be filled!");
        return
    }else{
        if (password != confirmPassword) {
            Swal.fire("Password doesn't match!");
            return
        }
        const data = {
            name,
            email,
            password,
            role: 'admin',
            createdAt: new Date()
        }
        fetchAPI('/credential/register', 'POST', data, 'This Email is Already Taken!', '?')
    }
}

function btnUpdateService(e) {  
    const service = $(e).val()
    const description = $('#textArea'+service).val()
    const price = $('#price'+service).val()
    var title = "Are you sure you want to update "+ service + " ?"
    const data = {service, price, description}
    if(!description || !price){
        Swal.fire("Price & Description must be filled");
        return
    }
    Swal.fire({
        icon: "warning",
        title,
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            fetchAPI('/plan/updateService', 'POST', data, "Something wrong while updating this service", '?')
        } else if (result.isDenied) {
          return
        }
    });
}

function btnCreatePlan(e) {  
    const mode = $(e).attr('mode')
    const name = $('#planName').val()
    const price = parseInt($('#planPrice').val())
    const urlQty = parseInt($('#qtyUrl').val())
    const qrQty = parseInt($('#qtyQr').val())
    const promptQty = parseInt($('#qtyPrompt').val())
    const bioQty = parseInt($('#qtyBio').val())
    const data = {name, price, url: urlQty, qr: qrQty, prompt: promptQty, bio: bioQty, createdAt: new Date()}
    if(!name || !planPrice){
        Swal.fire("Price & Description must be filled");
        return
    }
    if(urlQty == 0 && qrQty == 0 && promptQty == 0 && bioQty == 0){
        Swal.fire("There should be 1 service at minimum");
        return
    }
    if(mode == 'add'){
        fetchAPI('/plan/addPlan', 'POST', data, "Something wrong while adding this plan", '?')
    }else{
        const planId = $(e).val()
        data.planId = planId
        data.updatedAt = new Date()
        fetchAPI('/plan/editPlan', 'POST', data, "Something wrong while updating this service", '?')
    }
}

function btnEditPlan(e) { 
    const planId = $(e).val()
    const name = $(e).attr('planName')
    const price = $(e).attr('planPrice')
    const url = $(e).attr('url')
    const qr = $(e).attr('qr')
    const bio = $(e).attr('bio')
    const prompt = $(e).attr('prompt')
    $('#btnCancel').show()
    $('#btnCreate').val(planId)
    $('#btnCreate').attr('class', 'btn btn-success form-control mb-5')
    $('#btnCreate').attr('mode', 'edit')
    $('#btnCreate').html('Edit Plan')
    $('#planName').val(name)
    $('#planPrice').val(price)
    $('#qtyUrl').val(url)
    $('#qtyQr').val(qr)
    $('#qtyBio').val(bio)
    $('#qtyPrompt').val(prompt)
}

function btnCancelEditPlan(){
    $('#btnCancel').hide()
    $('#btnCreate').val('')
    $('#btnCreate').attr('class', 'btn btn-primary form-control mb-5')
    $('#btnCreate').html('Create Plan')
    $('#planName').val('')
    $('#planPrice').val('')
    $('#qtyUrl').val(0)
    $('#qtyQr').val(0)
    $('#qtyBio').val(0)
    $('#qtyPrompt').val(0)
}

function btnDeletePlan(e) {  
    const planId = $(e).val()
    Swal.fire({
        icon: "warning",
        title: 'Are you sure you want to delete this plan?',
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            fetchAPI('/plan/deletePlan/'+planId, 'DELETE', {}, "Something wrong while updating this service", '?')
        } else if (result.isDenied) {
          return
        }
    });
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