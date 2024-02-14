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
    // var target = document.getElementById(e.value)
    var target = $('#'+e.value)[0]

    link.download = 'qr-'+short+'.png';
    link.href = target.toDataURL()
    link.click();
}

function promptClick(e) {
    var newVal = $(e).val()
    $('#shortUrl').val(newVal)
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
                            $('#promptResult').append('<button onclick="promptClick(this)" class="btn btn-secondary" value="'+ val + '">'+ val +' </button>')
                        }
                        $('#promptBtn').html('Prompt')
                        $('#promptBtn').prop('disabled', false)
                    }
                    else if(response.status){
                        Swal.fire({
                        icon: "error",
                        title: "Ooops....",
                        text: "Something wrong",
                        });
                        $('#promptBtn').html('Prompt')
                        $('#promptBtn').prop('disabled', false)
                    }
                    else{
                    }
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
            fetch('/api/delete_url/'+shortUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(async (response) => {
                if (response.ok) {
                    window.location.href = "/qr";
                }
                else if(response.status){
                    Swal.fire({
                    icon: "error",
                    title: "Ooops....",
                    text: "Something went wrong while deleting the data!",
                    });
                }
                else{
                }
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
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
        type: 'qr'
    }
    fetch('/api/qrcode', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }).then(async (response) => {
        if (response.ok) {
            window.location.href = "/qr";
        }
        else if(response.status){
            Swal.fire({
            icon: "error",
            title: "Ooops....",
            text: "This Short URL is Already Taken!",
            });
        }
        else{
        }
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
}