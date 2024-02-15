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

function editQR(e) {  
    const full = $('#fullUrl').val()
    const title = $('#titleUrl').val()
    const short = $('#shortUrl').val()
    const oldShort = $('#oldShort').val()
    const oldDestination = $('#oldDestination').val()
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
        return
    }
    const data = {
        full,
        short,
        title,
        oldShort
    }
    const checkShort = (oldShort != short)? true : false
    const checkFull = (oldDestination != full)? true : false
    var status = true
    if(checkShort || checkFull){
        status = false
        Swal.fire({
            icon: "warning",
            title: "Changing Destination or Short Link will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                status = true
                fetchAPI('/api/qrcode/edit', 'POST', data, 'This Short URL is Already Taken!')
            }
        })
    }else{
        fetchAPI('/api/qrcode/edit', 'POST', data, 'This Short URL is Already Taken!')
    }
    
}
function deleteQR(e) {  
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
function addQr(e) {
    // try {
    const full = $('#fullUrl').val()
    const title = $('#titleUrl').val()
    const short = $('#shortUrl').val()
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
        return
    }
    const data = {
        full,
        short,
        title,
        clicks: 0,
        type: 'qr',
    }
    fetchAPI('/api/qrcode', 'POST', data, 'This Short URL is Already Taken!')
}

function fetchAPI(apiUrl, method, data, text){
    var config = {method, headers: {"Content-Type": "application/json"}}
    if(data){
        config.body = JSON.stringify(data)
    }
    fetch(apiUrl, config).then(async (response) => {
        if (response.ok) {
            window.location.href = "/qr";
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