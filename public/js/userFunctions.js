function loadImage(e, t){
    var key = $(t).attr('key')
    var image = document.getElementById('outputImg'+key);
    image.src = URL.createObjectURL(e.target.files[0]);
    // console.log('img1',image);
    $('#btnRemoveImg'+ key).show()
    $('#containerUpload'+ key).hide()
    $('#btnSave'+key).prop('disabled', false)
}

function removeImg(e) {  
    var key = $(e).attr('key')
    var image = document.getElementById('outputImg'+key);
    image.src = ''
    // console.log('img2',image);
    $('#containerUpload'+ key).show()
    $('#btnRemoveImg'+ key).hide()
    $('#btnSave'+key).prop('disabled', true)
}


async function submitImg(e) {
    const key = $(e).val()
    const email = $(e).attr('email')
    const imgUrl = $('#imgUrl'+key).val()
    let postid = uuidv4();
    let inputElem = document.getElementById("file"+key);
    let file = inputElem.files[0];
    let blob = file.slice(0, file.size, "image/png");
    newFile = new File([blob], `${postid}_post.png`, { type: "image/jpeg" });
    let formData = new FormData();
    formData.append("imgfile", newFile);
    $('#btnSave'+key).html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Loading...')
    $('#btnSave'+key).prop('disabled', true)
    $('#btnCancel'+key).prop('disabled', true)
    $('#btnRemoveImg'+key).prop('disabled', true)
    var apiUrl = "/api/addImg/user/" + email
    var location = "?"
    fetch(apiUrl, {
        method: "POST",
        body: formData,
    }).then(async (response) => {
        if (response.ok) {
            //if want to replace image -> run the delete function the first image
            if(imgUrl){
                const imgName = imgUrl.split('/')[4]
                fetch("/api/deleteImg/"+imgName, {method: "DELETE", body: JSON.stringify(imgName)}).then(async (response) =>{
                    if(response.ok) console.log('Success Delete');
                }).catch((error) => {
                    alert('WARNINGHUH!')
                    console.log(error);
                });
            }
            const img = await response.text()
            const url = `url('${img}')`.toString()
            $('#imgUrl'+key).val('img')
            const btnImg = document.getElementById('btnImg'+key)
            setTimeout(() => {
                btnImg.style.backgroundImage = url;
                window.location.href = location;
                location.load()
            }, 4700);
        }
        else if(response.status){
            Swal.fire({
            icon: "error",
            title: "Ooops....",
            text: 'file must be lesser than 3.5MB',
            });
            $('#btnCancel'+key).prop('disabled', false)
            $('#btnRemoveImg'+key).prop('disabled', false)
            $('#btnRemoveImg'+ key).show()
            $('#containerUpload'+ key).hide()
            $('#btnSave'+key).html('Save')
        }
    }).catch((error) => {
        alert('WARNING!!?@#?!@')
        console.log(error);
    });
}

function btnDeleteImg(e) {
    const email = $(e).attr('email')
    const imgUrl = $(e).attr('imgUrl')
    const imgName = imgUrl.split('/')[4]
    const data = {updatedAt: new Date(), short: email, collection:'users', type: 'profile'}
    var destination = '?'
    $(e).html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Loading...')
    $(e).prop('disabled', true)
    if(imgName){
        fetch("/api/deleteImg/"+imgName, {method: "DELETE", body: JSON.stringify(imgName)}).then(async (response) =>{
            if(response.ok) console.log('Success Delete');
        }).catch((error) => {
            alert('WARNINGHUH!')
            console.log(error);
        })
    }
    fetchAPI('/api/deleteField', 'POST', data, 'Something wrong while deleting the data!', destination)
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
}
