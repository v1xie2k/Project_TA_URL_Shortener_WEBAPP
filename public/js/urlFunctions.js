var destination
if(window.location.href.split('/')[3] == 'url') destination = '/url'
if(window.location.href.split('/')[3] == 'qr') destination ='/qr'


function generateQr(elementId, shortUrl){
    new QRious({
        element: document.getElementById(elementId),
        value: "http://127.0.0.1/" + shortUrl,
        padding:25,
        size:200
    })
}

function downloadQR(e) {  
    var link = document.createElement('a');
    var short = e.getAttribute('short')
    var target = $('#'+e.value)[0]

    link.download = 'qr-'+short+'.png';
    link.href = target.toDataURL()
    link.click();
}

function promptClick(e) {
    var newVal = $(e).val()
    $('#shortUrl').val(newVal)
    if($(location).attr("pathname").includes('/edit')){
        generateQr("qrCode", newVal)
    }
}

function promptRecommendation(e){
    var fullUrl = $('#fullUrl').val()
    if(!fullUrl){
        Swal.fire("Destination must be filled first!");
    }else{
        Swal.fire({
            icon: "warning",
            title: "Prompting will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                $('#promptBtn').html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Loading...')
                $('#promptBtn').prop('disabled', true)
                const data = {
                    full: fullUrl
                }
                fetch('/api/prompt', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }).then(async (response) => {
                    if (response.ok) {
                        $('#promptResult').html('')
                        const prompt = await response.json()
                        const list = prompt.promptResult.split("\n")
                        const newList = []
                        for (const iterator of list) {
                            var val = iterator.substr(2, iterator.length)
                            val = val.trim()
                            $('#promptResult').append('<button onclick="promptClick(this)" class="btn btn-secondary prompt-res" value="'+ val + '">'+ val +' </button>')
                        }
                    }
                    else if(response.status){
                        Swal.fire({
                        icon: "error",
                        title: "Ooops....",
                        text: "Something wrong",
                        });
                    }
                    $('#promptBtn').html('Prompt')
                    $('#promptBtn').prop('disabled', false)
                }).catch((error) => {
                    alert('WARNING!')
                    console.log(error);
                    $('#promptBtn').html('Prompt')
                    $('#promptBtn').prop('disabled', false)
                });
                
            }
        })
    }
}

async function btnAddUrl(e) {
    // try {
    const full = $('#fullUrl').val()
    const title = $('#titleUrl').val()
    const short = $('#shortUrl').val()
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
        return
    }
    if(!await checkUrl(short)){
        Swal.fire("Can't use that url");
        return
    }
    if(!await isHttpValid(full)){
        Swal.fire("Invalid url");
        return
    }
    const data = {
        full,
        short,
        title,
        clicks: 0,
        createdAt: new Date()
    }
    if(destination == '/url') $('#switch').prop('checked') ? data.type = 'qr' : null
    if(destination == '/qr') data.type = 'qr'
    fetchAPI('/api/url', 'POST', data, 'This Short URL is Already Taken!')
}

async function btnEditUrl(e) {  
    const full = $('#fullUrl').val()
    const title = $('#titleUrl').val()
    const short = $('#shortUrl').val()
    const oldShort = $('#oldShort').val()
    const oldDestination = $('#oldDestination').val()
    
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
        return
    }
    if(!await checkUrl(short)){
        Swal.fire("Can't use that url");
        return
    }
    if(!await isHttpValid(full)){
        Swal.fire("Invalid url");
        return
    }
    const data = {
        full,
        short,
        title,
        oldShort,
        updatedAt: new Date()
    }
    const checkShort = (oldShort != short)? true : false
    const checkFull = (oldDestination != full)? true : false
    const switchBtn = $('#switch').prop('checked')
    if(checkShort || checkFull || switchBtn){
        Swal.fire({
            icon: "warning",
            title: "Adding QR Code, Changing Destination or Short Link will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                if(switchBtn) data.type = 'qr'
                fetchAPI('/api/url/edit', 'POST', data, 'This Short URL is Already Taken!')
            }
        })
    }else{
        fetchAPI('/api/url/edit', 'POST', data, 'This Short URL is Already Taken!')
    }
    
}
function btnDeleteUrl(e) {  
    const shortUrl = $(e).val()
    Swal.fire({
    icon: "warning",
    title: "Do you want to Delete this Data?",
    showCancelButton: true,
    confirmButtonText: "Yes",
    }).then((result) => {
        if (result.isConfirmed) {
            fetchAPI('/api/delete_url/'+shortUrl, 'DELETE', null, 'Something went wrong while deleting the data!')
        }
    });
}

function fetchAPI(apiUrl, method, data, text){
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

function isHttpValid(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

function checkUrl(url){
    const urlShort = url.toLowerCase()
    if(urlShort == 'qr' || urlShort == 'login' || urlShort == 'register' || urlShort =='url' || urlShort == 'biolink' || urlShort == 'm'){
        return false
    }
    return true
}