async function btnAddBioLink(e){
    const short = $('#shortUrl').val()
    if(!short){
        Swal.fire("Short URL must be filled!");
        return
    }
    if(!await checkUrl(short)){
        Swal.fire("Can't use that url!");
        return
    }
    const data = {
        short,
        title: short,
        clicks: 0,
        createdAt: new Date()
    }
    fetchAPI('/api/biolink', 'POST', data, 'This Short URL is Already Taken!', '/biolink')

}

function btnDeleteBioLink(e) {  
    const shortUrl = $(e).val()
    Swal.fire({
    icon: "warning",
    title: "Do you want to Delete this Bio Link?",
    text: "All Short URL inside this Bio Link will also be deleted",
    showCancelButton: true,
    confirmButtonText: "Yes",
    }).then((result) => {
        if (result.isConfirmed) {
            fetchAPI('/api/delete_bio_link/'+shortUrl, 'DELETE', null, 'Something went wrong while deleting the data!', '/biolink')
        }
    });
}

async function btnEditBioLink(e) {  
    const newBio = $('#editShortBio').val()
    const oldBio = $('#bioLink').val()
    const title = newBio
    if (!newBio) {
        Swal.fire("Short Url must be filled!");
        return
    }
    if(!await checkUrl(newBio)){
        Swal.fire("Can't use that url");
        return
    }
    const data = {
        short: newBio,
        title,
        oldShort: oldBio,
        updatedAt: new Date()
    }
    console.log(data);
    const checkShort = (newBio != oldBio)? true : false
    if(checkShort){
        Swal.fire({
            icon: "warning",
            title: "Changing Short URL will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                fetchAPI('/api/biolink/edit', 'POST', data, 'This Short Bio Link is Already Taken!', '/biolink/edit/'+newBio)
            }
        })
    }else{
        fetchAPI('/api/biolink/edit', 'POST', data, 'This Short Bio Link is Already Taken!', '/biolink/edit/'+newBio)
    }

}

async function btnToogleLink(e) {  
    $('.form-bio-link').show()
    $('.form-youtube').hide()
    clearInput('url')
}
async function btnToogleYoutube(e) {
    $('.form-youtube').show()
    $('.form-bio-link').hide()
    clearInput('youtube')
}

async function btnCancel(e) {  
    const val = $(e).val()
    clearInput(val)
    // cara kepepet
    // window.location.href = '?build'
    if(val == 'url'){
        $('.form-bio-link').hide()
    }else{
        $('.form-youtube').hide()
    }
}

async function btnAddUrl(e) {
    // try {
    var isYoutube = $(e).val()
    var full = isYoutube ? $('#youtubeUrl').val() : $('#fullUrl').val()
    var youtubeId = await validateYouTubeUrl(full)
    if(isYoutube){
        await loadThumbnail(youtubeId)
    }
    var title = $('#titleUrl').val()
    var bioLink = $('#bioLink').val()
    var description = $('#description').val()
    
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
        return
    }
    if(!await isHttpValid(full)){
        Swal.fire("Invalid url");
        return
    }
    const data = {
        full,
        bioLink,
        title,
        description,
        clicks: 0,
        createdAt: new Date()
    }
    if(isYoutube){
        data.type = 'youtube'
        data.youtubeId = youtubeId
    }
    fetchAPI('/api/url', 'POST', data, 'This Short URL is Already Taken!', '?build')
    $('.form-youtube').hide()
    $('.form-bio-link').hide()
}

async function btnClickEditUrl(e) { 
    $('.form-youtube').hide()
    $('.form-bio-link').hide()
    const short = $(e).val()
    const title = $(e).attr('urlTitle')
    const youtubeId = $(e).attr('youtubeId')
    const destination = $(e).attr('destination')
    const description = $(e).attr('description')
    $('#shortUrlEdit').val(short)
    $('#oldDestination').val(destination)
    $('#fullUrl').val(destination)
    $('#btnSubmitUrl').hide()
    $('#btnSaveUrl').show()
    if(youtubeId){
        $('.form-youtube').show()
        await loadThumbnail(youtubeId)
    }else{
        $('.form-bio-link').show()
        $('#titleUrl').val(title)
        $('#description').val(description)
    }
}

async function btnEditUrl(e) {  
    const isYoutube = $(e).val()
    const full = isYoutube ? $('#youtubeUrl').val() : $('#fullUrl').val()
    const youtubeId = await validateYouTubeUrl(full)
    if(isYoutube){
        await loadThumbnail(youtubeId)
    }
    const title = $('#titleUrl').val()
    const short = $('#shortUrlEdit').val()
    const oldShort = short
    const description = $('#description').val()
    const oldDestination = $('#oldDestination').val()
    
    if (!full || !title) {
        Swal.fire("Destination & Title must be filled");
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
        description,
        updatedAt: new Date()
    }
    if(isYoutube){
        data.youtubeId = youtubeId
    }
    const checkFull = (oldDestination != full)? true : false
    if(checkFull){
        Swal.fire({
            icon: "warning",
            title: "Changing Destination will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                fetchAPI('/api/url/edit', 'POST', data, 'This Short URL is Already Taken!', '?build')
            }
        })
    }else{
        fetchAPI('/api/url/edit', 'POST', data, 'This Short URL is Already Taken!', '?build')
    }
}

function btnDeleteUrl(e) {  
    const key = $(e).val()
    const shortUrl = $(e).attr('short')
    const imgUrl = $('#imgUrl'+key).val()
    Swal.fire({
    icon: "warning",
    title: "Do you want to Delete this Data?",
    showCancelButton: true,
    confirmButtonText: "Yes",
    }).then((result) => {
        if (result.isConfirmed) {
            if(imgUrl){
                const imgName = imgUrl.split('/')[4]
                fetch("/api/deleteImg/"+imgName, {method: "DELETE", body: JSON.stringify(imgName)}).then(async (response) =>{
                    if(response.ok) console.log('Success Delete');
                }).catch((error) => {
                    alert('WARNINGHUH!')
                    console.log(error);
                });
            }
            fetchAPI('/api/delete_url/'+shortUrl, 'DELETE', null, 'Something went wrong while deleting the data!', '?')
        }
    });
}


async function getYoutube(e) {  
    const val = $(e).val()
    var youtubeId = await validateYouTubeUrl(val)
    await loadThumbnail(youtubeId)
}

async function loadThumbnail(youtubeId) {  
    var config = {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({youtubeId})}
    
    if(youtubeId != false){
        var thumbnail = 'https://i.ytimg.com/vi/'+youtubeId+'/mqdefault.jpg'
        var title
        await fetch('/api/getYoutubeInfo', config).then(async (response) => {
            const resp = await response.json()
            title = resp.result.items[0].snippet.title
        }).catch((error) => {
            alert('WARNING!')
            console.log(error);
        });
        $('#titleUrl').val(title)
        $("#youtubePlaceHolder").html("<img src='"+thumbnail+"' style='width: 100%; heigth: 100%; border-radius: 5px;'>");
        $('#alertYoutube').hide()
        $("#youtubeTitle").html('<h4>Video Title</h4><p>' + title + '</p>')
    }else{
        $("#youtubeTitle").html('<p style="padding-top: 35px;">Add a YouTube URL above to preview the video</p>')
        $("#youtubePlaceHolder").html('<div style="padding-top: 22px;"><span class="video-placeholder"><svg width="3rem" height="3rem" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M47.044 12.3709C46.7726 11.3498 46.2378 10.4178 45.493 9.66825C44.7483 8.91872 43.8197 8.37794 42.8003 8.10003C39.0476 7.09094 24.0476 7.09094 24.0476 7.09094C24.0476 7.09094 9.04761 7.09094 5.29488 8.10003C4.27547 8.37794 3.34693 8.91872 2.60218 9.66825C1.85744 10.4178 1.32262 11.3498 1.05124 12.3709C0.0476075 16.14 0.0476074 24 0.0476074 24C0.0476074 24 0.0476075 31.86 1.05124 35.6291C1.32262 36.6503 1.85744 37.5823 2.60218 38.3318C3.34693 39.0813 4.27547 39.6221 5.29488 39.9C9.04761 40.9091 24.0476 40.9091 24.0476 40.9091C24.0476 40.9091 39.0476 40.9091 42.8003 39.9C43.8197 39.6221 44.7483 39.0813 45.493 38.3318C46.2378 37.5823 46.7726 36.6503 47.044 35.6291C48.0476 31.86 48.0476 24 48.0476 24C48.0476 24 48.0476 16.14 47.044 12.3709Z" fill="#FF0302"></path><path d="M19.1385 31.1373V16.8628L31.684 24.0001L19.1385 31.1373Z" fill="#FEFEFE"></path></svg></span></div>  ');
        $('#alertYoutube').show()
        return
    }
}

function clearInput(type) {  
    if(type == 'youtube'){
        $('#youtubeUrl').val(null)
        $("#youtubeTitle").html('<p style="padding-top: 35px;">Add a YouTube URL above to preview the video</p>')
        $("#youtubePlaceHolder").html('<div style="padding-top: 22px;"><span class="video-placeholder"><svg width="3rem" height="3rem" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M47.044 12.3709C46.7726 11.3498 46.2378 10.4178 45.493 9.66825C44.7483 8.91872 43.8197 8.37794 42.8003 8.10003C39.0476 7.09094 24.0476 7.09094 24.0476 7.09094C24.0476 7.09094 9.04761 7.09094 5.29488 8.10003C4.27547 8.37794 3.34693 8.91872 2.60218 9.66825C1.85744 10.4178 1.32262 11.3498 1.05124 12.3709C0.0476075 16.14 0.0476074 24 0.0476074 24C0.0476074 24 0.0476075 31.86 1.05124 35.6291C1.32262 36.6503 1.85744 37.5823 2.60218 38.3318C3.34693 39.0813 4.27547 39.6221 5.29488 39.9C9.04761 40.9091 24.0476 40.9091 24.0476 40.9091C24.0476 40.9091 39.0476 40.9091 42.8003 39.9C43.8197 39.6221 44.7483 39.0813 45.493 38.3318C46.2378 37.5823 46.7726 36.6503 47.044 35.6291C48.0476 31.86 48.0476 24 48.0476 24C48.0476 24 48.0476 16.14 47.044 12.3709Z" fill="#FF0302"></path><path d="M19.1385 31.1373V16.8628L31.684 24.0001L19.1385 31.1373Z" fill="#FEFEFE"></path></svg></span></div>  ');
        $('#alertYoutube').hide()
    }else{
        $('#btnSaveUrl').hide()   
        $('#btnSubmitUrl').show()
    }
    $('#fullUrl').val(null)
    $('#titleUrl').val(null)
    $('#description').val(null)
    
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
function btnCopyClick(e){
    navigator.clipboard.writeText($(e).val());
}

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
    const short = $(e).attr('short')
    const imgUrl = $('#imgUrl'+key).val()
    let postid = uuidv4();
    let inputElem = document.getElementById("file"+key);
    let file = inputElem.files[0];
    let blob = file.slice(0, file.size, "image/png");
    newFile = new File([blob], `${postid}_post.png`, { type: "image/jpeg" });
    let formData = new FormData();
    formData.append("imgfile", newFile);
    $('#btnSave'+key).html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Loading...')
    $('#btnCancel'+key).prop('disabled', true)
    $('#btnRemoveImg'+key).prop('disabled', true)
    var apiUrl = "/api/addImg/url/" + short
    var location = "?build"
    if(key == "Background") apiUrl = "/api/addImg/background/" + short
    if(key == "Avatar") apiUrl = "/api/addImg/avatar/" + short
    if(key == "Avatar" || key == "Background") location ="?profile"
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
    const type = $(e).attr('btnCategory')
    const short = $(e).attr('short')
    const imgUrl = $(e).attr('imgUrl')
    const imgName = imgUrl.split('/')[4]
    const data = {updatedAt: new Date(), short, oldShort: short, collection:'biolinks', type}
    var destination = '?profile'
    if(imgName){
        fetch("/api/deleteImg/"+imgName, {method: "DELETE", body: JSON.stringify(imgName)}).then(async (response) =>{
            if(response.ok) console.log('Success Delete');
        }).catch((error) => {
            alert('WARNINGHUH!')
            console.log(error);
        })
    }
    if(type == 'img'){
        data.type = 'img'
        data.collection= 'shorturls'
        destination = '?build'
    }
    fetchAPI('/api/deleteField', 'POST', data, 'Something wrong while deleting the data!', destination)
}

async function btnEditProfile(e) {  
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
    const short = $(e).attr('short')
    const title = $('#pageTitle').val()
    const description = $('#pageDescription').val()
    const instagram = $('#socialInstagram').val()
    const facebook = $('#socialFacebook').val()
    const youtube = $('#socialYoutube').val()
    if(instagram){
        if(!await checkSocialMedia(instagram, 'instagram')) {
            Swal.fire("Please enter a valid instagram URL");
            return
        }
    }
    if(facebook){
        if(!await checkSocialMedia(facebook, 'facebook')) {
            Swal.fire("Please enter a valid facebook URL");
            return
        }
    }
    if(youtube){
        if(!await checkSocialMedia(youtube, 'youtube')) {
            Swal.fire("Please enter a valid youtube URL");
            return
        }
    }
    const data = {updatedAt: new Date(), short, oldShort: short, collection:'biolinks', pageTitle: title, pageDescription: description, instagram, facebook, youtube}
    if(!title) data.deletePageTitle = true
    if(!description) data.deletePageDescription = true
    if(!instagram) data.deleteInstagram = true
    if(!facebook) data.deleteFacebook = true
    if(!youtube) data.deleteYoutube = true
    if(data){
        config.body = JSON.stringify(data)
    }
    $('#btnSaveUrl').html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Saving...')
    await fetch('/api/deleteField', config).then(async (response) => {
        if (response.ok) {
         console.log('success');
        }
    }).catch((error) => {
        alert('WARNING ERROR WHILE DELETING!')
        console.log(error);
    });
    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while editing the data!', '?profile')
}

function checkUrl(url){
    const urlShort = url.toLowerCase()
    if(urlShort == 'qr' || urlShort == 'login' || urlShort == 'register' || urlShort =='url' || urlShort == 'biolink' || urlShort == 'm' || urlShort == 'plan' || urlShort == 'user' || urlShort == 'analytic' || urlShort == 'admin'){
        return false
    }
    return true
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
}

function checkSocialMedia(url, type) {
    var pattern
    if(type == 'instagram') pattern = new RegExp(/^https:\/\/www\.instagram\.com\/[a-zA-Z0-9_.-]+\/?$/)
    if(type == 'facebook') pattern = new RegExp(/^https:\/\/www\.facebook\.com\/[a-zA-Z0-9_.-]+\/?$/)
    if(type == 'youtube') pattern = new RegExp(/^https:\/\/www\.youtube\.com\/(?:c\/|channel\/|user\/|@)?[a-zA-Z0-9_-]+$/)
    if(url.match(pattern)) return true
    return false
}

function isHttpValid(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

function validateYouTubeUrl(url)
{
    const p = new RegExp(/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
    if(url.match(p)){
        return url.match(p)[1]
    }
    return false;
}
