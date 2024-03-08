async function btnAddBioLink(e){
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
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
        createdAt: new Date(),
        type: 'bio'
    }
    config.body = JSON.stringify(data)
    fetch('/credential/checkCredit', config).then(async (response) => {
        if (response.ok) {
            fetch('/api/biolink', config).then(async (response) => {
                if (response.ok) {
                    fetch('/credential/reduceCredit', config).then(async (response) => {
                        if (response.ok) {
                            window.location.href = '/biolink';
                        }
                        else if(response.status){
                            Swal.fire({icon: "error", title: "Ooops....", text: 'something wrong'});
                        }
                    }).catch((error) => {
                        alert('WARNING!')
                        console.log(error);
                    });
                }
                else if(response.status){
                    Swal.fire({icon: "error", title: "Ooops....", text: 'This Bio Link is Already Taken!'});
                }
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
        }
        else if(response.status){
            Swal.fire({icon: "error", title: "Ooops....", text: 'Insufficient Credit!'});
        }
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    })
}

function btnDeleteBioLink(e) {
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
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
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
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
        updatedAt: new Date(),
        type: 'bio'
    }
    config.body = JSON.stringify(data)
    const checkShort = (newBio != oldBio)? true : false
    if(checkShort){
        Swal.fire({
            icon: "warning",
            title: "Changing Back Half will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                fetch('/credential/checkCredit', config).then(async (response) => {
                    if (response.ok) {
                        fetch('/api/biolink/edit', config).then(async (response) => {
                            if (response.ok) {
                                fetch('/credential/reduceCredit', config).then(async (response) => {
                                    if (response.ok) {
                                        window.location.href = '/biolink/edit/' + newBio
                                    }
                                    else if(response.status){
                                        Swal.fire({icon: "error", title: "Ooops....", text: 'something wrong'});
                                    }
                                }).catch((error) => {
                                    alert('WARNING!')
                                    console.log(error);
                                });
                            }
                            else if(response.status){
                                Swal.fire({icon: "error", title: "Ooops....", text: 'This Bio Link is Already Taken!'});
                            }
                        }).catch((error) => {
                            alert('WARNING!')
                            console.log(error);
                        });
                    }
                    else if(response.status){
                        Swal.fire({icon: "error", title: "Ooops....", text: 'Insufficient Credit!'});
                    }
                }).catch((error) => {
                    alert('WARNING!')
                    console.log(error);
                })
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
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
    var isYoutube = $(e).val()
    var full = isYoutube ? $('#youtubeUrl').val() : $('#fullUrl').val()
    var youtubeId = await validateYouTubeUrl(full)
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = reportDataString != '' ? await JSON.parse(reportDataString) : []
    var order = blocks.length == 0 ? 1 : blocks[blocks.length - 1].order + 1
    if(isYoutube){
        await loadThumbnail(youtubeId)
    }
    var title = $('#titleUrl').val()
    var bioLink = $('#bioLink').val()
    var description = $('#description').val()
    console.log(full);
    console.log(title);
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
    const urlData = {title, full, description, order, type: 'link', createdAt: new Date()}
    if(isYoutube){
        urlData.type = 'youtube'
        urlData.youtubeId = youtubeId
        data.type = 'youtube'
        data.youtubeId = youtubeId
    }
    config.body = JSON.stringify(data)
    fetch('/credential/checkCredit', config).then(async (response) => {
        if (response.ok) {
            fetch('/api/url', config).then(async (response) => {
                if (response.ok) {
                    const resultUrl = await response.json()
                    urlData.short = resultUrl.short
                    fetch('/credential/reduceCredit', config).then(async (response) => {
                        if (response.ok) {
                            blocks.push(urlData)
                            const data = {oldShort : bioLink, short: bioLink, blocks }
                            await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding link!', '?build')
                        }
                        else if(response.status){
                            Swal.fire({icon: "error", title: "Ooops....", text: 'something wrong'});
                        }
                    }).catch((error) => {
                        alert('WARNING!12556')
                        console.log(error);
                    });
                }
                else if(response.status){
                    Swal.fire({icon: "error", title: "Ooops....", text: 'This Short URL is Already Taken!'});
                }
            }).catch((error) => {
                alert('WARNING!1245')
                console.log(error);
            });
        }
        else if(response.status){
            Swal.fire({icon: "error", title: "Ooops....", text: 'Insufficient Credit!'});
        }
    }).catch((error) => {
        alert('WARNING!123')
        console.log(error);
    })
    $('.form-youtube').hide()
    $('.form-bio-link').hide()
}

async function btnClickEditUrl(e) { 
    $('.form-youtube').hide()
    $('.form-bio-link').hide()
    const short = $(e).val()
    const key = $(e).attr('key')
    const title = $(e).attr('urlTitle')
    const youtubeId = $(e).attr('youtubeId')
    const destination = $(e).attr('destination')
    const description = $(e).attr('description')
    const cat = $(e).attr('cat')
    $('#shortUrlEdit').val(short)
    $('#oldDestination').val(destination)
    $('#fullUrl'+ key).val(destination)
    if(youtubeId){
        $('.form-youtube').show()
        $('#youtubeUrl').val(destination)
        $('#btnSaveUrlYoutube').show()
        $('#btnSubmitYoutube').hide()
        $('#modalYoutubeLabel2').html('Edit youtube video')
        await loadThumbnail(youtubeId)
    }else{
        if(cat == 'spotify'){
            $('#spotifyUrl').val(destination)
            $('#modalSpotifyLabel2').html('Edit Spotify media')
            $('#btnSaveSpotify').show()
            $('#btnSubmitSpotify').hide()
        }else if(cat == 'soundCloud'){
            $('#soundCloudUrl').val(destination)
            $('#modalSoundCloudLabel2').html('Edit Soundcloud media')
            $('#btnSaveSoundCloud').show()
            $('#btnSubmitSoundCloud').hide()
        }else if(cat == 'pdf'){
            const pdfTitle = $(e).attr('pdfTitle')
            const pdf = $(e).attr('pdf')
            const pdfName = pdf.split('/')[4]
            $('#pdfTitle').val(pdfTitle)
            $('#pdfUrl').val(pdf)
            $('#pdfName').val(pdfName)
            $('#modalPdfLabel').html('Edit Pdf')
            $('#btnSavePdf').show()
            $('#btnSubmitPdf').hide()
        }else if(cat == 'slider'){
            const key = $(e).attr('key')
            const createdAt = $(e).attr('createdAt')
            $('#slider'+key).show()
            console.log(key);
        }else{
            $('.form-bio-link').show()
            $('#titleUrl'+key).val(title)
            $('#description'+key).val(description)
        }
        
    }
}

function btnModalYoutubeClose(e) {  
    $('#youtubeUrl').val('')
    $('#btnSaveUrlYoutube').hide()
    $('#btnSubmitYoutube').show()
    $('#modalYoutubeLabel2').html('Add a youtube video')
    clearInput('youtube')
}

function btnModalSpotifyClose(e) {  
    $('#spotifyUrl').val('')
    $('#btnSaveSpotify').hide()
    $('#btnSubmitSpotify').show()
    $('#modalSpotifyLabel2').html('Add Spotify media')
}

function btnModalSoundCloudClose(e) {  
    $('#soundCloudUrl').val('')
    $('#btnSaveSoundCloud').hide()
    $('#btnSubmitSoundCloud').show()
    $('#modalSoundCloudLabel2').html('Add Soundcloud media')
}

async function btnEditUrl(e) {
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = await JSON.parse(reportDataString)
    const key = $(e).attr('key')
    const bioLink = $('#bioLink').val()
    const isYoutube = $(e).val()
    const full = isYoutube == 'youtube' ? $('#youtubeUrl').val() : $('#fullUrl'+key).val()
    console.log( full);
    const youtubeId = await validateYouTubeUrl(full)
    
    const title = isYoutube == 'youtube' ? $('#titleYtube').val() : $('#titleUrl'+key).val()
    const short = $('#shortUrlEdit').val()
    const oldShort = short
    const description = $('#description'+key).val()
    const oldDestination = $('#oldDestination').val()
    if(isYoutube){
        await loadThumbnail(youtubeId)
    }
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
    console.log(data);
    if(isYoutube){
        data.youtubeId = youtubeId
    }
    config.body = JSON.stringify(data)
    const checkFull = (oldDestination != full)? true : false
    for (const data of blocks) {
        if(data.full == oldDestination){
            data.full = full
            data.title = title 
            data.description = description
            if(isYoutube){
                data.youtubeId = youtubeId
            }
        }
    }
    const newBioData = {oldShort : bioLink, short: bioLink, blocks }
    if(checkFull){
        Swal.fire({
            icon: "warning",
            title: "Changing Destination will cost you 1 credit! Are you sure about it?",
            showCancelButton: true,
            confirmButtonText: "Go",
        }).then(async (result) => {
            if(result.isConfirmed){
                fetch('/credential/checkCredit', config).then(async (response) => {
                    if (response.ok) {
                        fetch('/api/url/edit', config).then(async (response) => {
                            if (response.ok) {
                                fetch('/credential/reduceCredit', config).then(async (response) => {
                                    if (response.ok) {
                                        await fetchAPI('/api/biolink/edit', 'POST', newBioData, 'Something wrong while adding link!', '?build')
                                    }
                                    else if(response.status){
                                        Swal.fire({icon: "error", title: "Ooops....", text: 'something wrong'});
                                    }
                                }).catch((error) => {
                                    alert('WARNING!3')
                                    console.log(error);
                                });
                            }
                            else if(response.status){
                                Swal.fire({icon: "error", title: "Ooops....", text: 'This Short URL is Already Taken!'});
                            }
                        }).catch((error) => {
                            alert('WARNING!2')
                            console.log(error);
                        });
                    }
                    else if(response.status){
                        Swal.fire({icon: "error", title: "Ooops....", text: 'Insufficient Credit!'});
                    }
                }).catch((error) => {
                    alert('WARNING!1')
                    console.log(error);
                });

            }
        })
    }else{
        fetchAPI('/api/url/edit', 'POST', data, 'This Short URL is Already Taken!', '?')
        await fetchAPI('/api/biolink/edit', 'POST', newBioData, 'Something wrong while adding link!', '?build')
    }
}

async function btnDeleteUrl(e) {  
    const key = $(e).val()
    const shortUrl = $(e).attr('short')
    const imgUrl = $('#imgUrl'+key).val()
    const cat = $(e).attr('cat')
    const short = $('#bioLink').val()
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = await JSON.parse(reportDataString)
    Swal.fire({
    icon: "warning",
    title: "Do you want to Delete this Data?",
    showCancelButton: true,
    confirmButtonText: "Yes",
    }).then(async (result) => {
        if (result.isConfirmed) {
            if(cat == 'spotify' || cat == 'soundcloud'){
                const full = $(e).attr('full')
                const filteredBlocks = blocks.filter(x => x.full != full)
                const data = {oldShort : short, short, blocks: filteredBlocks }
                await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while deleting ' + cat , '?build')
            }else if(cat == 'pdf'){
                const pdf = $(e).attr('pdf')
                const filteredBlocks = blocks.filter(x => x.pdf != pdf)
                const data = {oldShort : short, short, blocks: filteredBlocks }
                const pdfName = pdf.split('/')[4]
                if(pdfName){
                    fetch("/api/deleteImg/"+pdfName, {method: "DELETE", body: JSON.stringify(pdfName)}).then(async (response) =>{
                        if(response.ok) console.log('Success Delete');
                    }).catch((error) => {
                        alert('WARNINGHUH!')
                        console.log(error);
                    })
                }
                await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while deleting ' + cat , '?build')
            }else if(cat == 'slider'){
                const createdAt = $(e).attr('createdAt')
                const filteredBlocks = blocks.filter(x => x.createdAt != createdAt)
                const data = {oldShort : short, short, blocks: filteredBlocks }
                await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while deleting ' + cat , '?build')
            }else{
                if(imgUrl){
                    const imgName = imgUrl.split('/')[4]
                    fetch("/api/deleteImg/"+imgName, {method: "DELETE", body: JSON.stringify(imgName)}).then(async (response) =>{
                        if(response.ok) console.log('Success Delete');
                    }).catch((error) => {
                        alert('WARNINGHUH!')
                        console.log(error);
                    });
                }
                const filteredBlocks = blocks.filter(x => x.short != shortUrl)
                const data = {oldShort : short, short, blocks: filteredBlocks }
                fetchAPI('/api/delete_url/'+shortUrl, 'DELETE', null, 'Something went wrong while deleting the data!', '?')
                await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while deleting spotify!', '?build')
            }
        }
    });
}

async function btnAddSpotify(e) {  
    const spotifyLink = $('#spotifyUrl').val()
    const short = $(e).attr('short')
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = reportDataString != '' ? await JSON.parse(reportDataString) : []
    var order = blocks.length == 0 ? 1 : blocks[blocks.length - 1].order + 1
    if(!spotifyLink){
        Swal.fire("Please enter a spotify track!");
        return
    }else{
        if(!checkSocialMedia('spotify', spotifyLink)){
            Swal.fire("Please enter a valid spotify track!");
            return
        }
    }
    const spotifyTrack = spotifyLink.split('/')[4]
    const spotifyData = {title: 'Spotify',full: spotifyLink, order, type:'spotify', createdAt: new Date(), spotifyTrack}
    blocks.push(spotifyData)
    const data = {oldShort : short, short, blocks }
    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding spotify!', '?build')
}

async function btnEditSpotify(e) {  
    const spotifyLink = $('#spotifyUrl').val()
    const short = $(e).attr('short')
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = await JSON.parse(reportDataString) 
    const oldDestination = $('#oldDestination').val()
    if(!spotifyLink){
        Swal.fire("Please enter a spotify track!");
        return
    }else{
        if(!checkSocialMedia('spotify', spotifyLink)){
            Swal.fire("Please enter a valid spotify track!");
            return
        }
    }
    const spotifyTrack = spotifyLink.split('/')[4]
    for (const data of blocks) {
        if(data.full == oldDestination){
            data.full = spotifyLink
            data.spotifyTrack = spotifyTrack
        }
    }
    const data = {oldShort : short, short, blocks }
    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while editing spotify!', '?build')
}

async function btnAddSoundCloud(e) {  
    const soundCloudLink = $('#soundCloudUrl').val()
    const short = $(e).attr('short')
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = reportDataString != '' ? await JSON.parse(reportDataString) : []
    var order = blocks.length == 0 ? 1 : blocks[blocks.length - 1].order + 1
    if(!soundCloudLink){
        Swal.fire("Please enter a Soundcloud track!");
        return
    }else{
        if(!checkSocialMedia('soundcloud', soundCloudLink)){
            Swal.fire("Please enter a valid Soundcloud link!");
            return
        }
    }
    const soundCloudData = {title: 'Soundcloud',full: soundCloudLink, order, type:'soundcloud', createdAt: new Date()}
    blocks.push(soundCloudData)
    const data = {oldShort : short, short, blocks }
    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding soundcloud!', '?build')
}

async function btnEditSoundCloud(e) {  
    const soundCloudLink = $('#soundCloudUrl').val()
    const short = $(e).attr('short')
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = reportDataString != '' ? await JSON.parse(reportDataString) : []
    const oldDestination = $('#oldDestination').val()
    if(!soundCloudLink){
        Swal.fire("Please enter a spotify track!");
        return
    }else{
        if(!checkSocialMedia('soundcloud', soundCloudLink)){
            Swal.fire("Please enter a valid spotify track!");
            return
        }
    }
    for (const data of blocks) {
        if(data.full == oldDestination){
            data.full = soundCloudLink
        }
    }
    const data = {oldShort : short, short, blocks }
    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while editing soundcloud!', '?build')
}

function loadPdf(e, t){
    $('.btnPdf').prop('disabled', false)
}

function removePdf(e) {  
    $('.btnPdf').prop('disabled', true)
}

async function btnAddPdf(e) {
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = reportDataString != '' ? await JSON.parse(reportDataString) : []
    const biolink = $('#bioLink').val()
    const pdfTitle = $('#pdfTitle').val()
    var order = blocks.length == 0 ? 1 : blocks[blocks.length - 1].order + 1
    let postid = uuidv4()
    let inputElem = document.getElementById("filePdf")
    let file = inputElem.files[0]
    let blob = file.slice(0, file.size, "application/pdf")
    newFile = new File([blob], `${postid}_post.pdf`, { type: "application/pdf" })
    let formData = new FormData();
    formData.append("file", newFile)
    if(!pdfTitle){
        Swal.fire("Please enter pdf's name !");
        return
    }
    fetch('/api/addPdf', {
        method: "POST",
        body: formData,
    }).then(async (response) => {
        if (response.ok) {
            const result = await response.text()
            const pdfData = {title: pdfTitle, pdf: result, order, type:'pdf', createdAt: new Date(), click: 0}
            blocks.push(pdfData)
            const data = {oldShort : biolink, short: biolink, blocks }
            await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding spotify!', '?build')
        }
        else if(response.status){
            Swal.fire({
            icon: "error",
            title: "Ooops....",
            text: 'file must be lesser than 3.5MB',
            });
        }
    }).catch((error) => {
        alert('WARNING!!?@#?!@')
        console.log(error);
    });
}

async function btnEditPdf(e) {
    const reportDataElement = document.getElementById('blocks')
    const reportDataString = reportDataElement.textContent
    const blocks = JSON.parse(reportDataString)
    const biolink = $('#bioLink').val()
    const pdfTitle = $('#pdfTitle').val()
    const oldPdf = $('#pdfUrl').val()
    var order = blocks[blocks.length - 1].order + 1
    let postid = uuidv4()
    let inputElem = document.getElementById("filePdf")
    let file = inputElem.files[0]
    if(!pdfTitle){
        Swal.fire("Please enter pdf's name !");
        return
    }
    if(file){
        let blob = file.slice(0, file.size, "application/pdf")
        newFile = new File([blob], `${postid}_post.pdf`, { type: "application/pdf" })
        let formData = new FormData();
        formData.append("file", newFile)
        fetch('/api/addPdf', {
            method: "POST",
            body: formData,
        }).then(async (response) => {
            if (response.ok) {
                const result = await response.text()
                if(result != oldPdf && result != undefined){
                    const pdfName = oldPdf.split('/')[4]
                    fetch("/api/deleteImg/"+pdfName, {method: "DELETE", body: JSON.stringify(pdfName)}).then(async (response) =>{
                        if(response.ok) console.log('Success Delete');
                    }).catch((error) => {
                        alert('WARNINGHUH!')
                        console.log(error);
                    })
                }
                for (const data of blocks) {
                    if(data.pdf == oldPdf){
                        data.pdf = result 
                        data.title = pdfTitle
                    }
                }
                console.log('result', result);
                const data = {oldShort : biolink, short: biolink, blocks }
                await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding spotify!', '?build')
            }
            else if(response.status){
                Swal.fire({
                icon: "error",
                title: "Ooops....",
                text: 'file must be lesser than 3.5MB',
                });
            }
        }).catch((error) => {
            alert('WARNING!!?@#?!@')
            console.log(error);
        });
    }else{
        for (const data of blocks) {
            if(data.pdf == oldPdf){
                data.title = pdfTitle
            }
        }
        const data = {oldShort : biolink, short: biolink, blocks }
        await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while adding spotify!', '?build')
    }
    
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
        $("#youtubePlaceHolder").html("<img src='"+thumbnail+"' style='width: 100%; heigth: 300px; border-radius: 5px;'>");
        $("#youtubePlaceHolder").css('background-color','white')
        $('#alertYoutube').hide()
        $("#youtubeTitle").html('<h4>Video Title</h4><p>' + title + '</p>')
        $('#titleYtube').val(title)
    }else{
        $("#youtubeTitle").html('<p style="padding-top: 35px;">Add a YouTube URL above to preview the video</p>')
        $("#youtubePlaceHolder").html('<div style="padding-top: 22px;"><span class="video-placeholder"><svg width="3rem" height="3rem" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M47.044 12.3709C46.7726 11.3498 46.2378 10.4178 45.493 9.66825C44.7483 8.91872 43.8197 8.37794 42.8003 8.10003C39.0476 7.09094 24.0476 7.09094 24.0476 7.09094C24.0476 7.09094 9.04761 7.09094 5.29488 8.10003C4.27547 8.37794 3.34693 8.91872 2.60218 9.66825C1.85744 10.4178 1.32262 11.3498 1.05124 12.3709C0.0476075 16.14 0.0476074 24 0.0476074 24C0.0476074 24 0.0476075 31.86 1.05124 35.6291C1.32262 36.6503 1.85744 37.5823 2.60218 38.3318C3.34693 39.0813 4.27547 39.6221 5.29488 39.9C9.04761 40.9091 24.0476 40.9091 24.0476 40.9091C24.0476 40.9091 39.0476 40.9091 42.8003 39.9C43.8197 39.6221 44.7483 39.0813 45.493 38.3318C46.2378 37.5823 46.7726 36.6503 47.044 35.6291C48.0476 31.86 48.0476 24 48.0476 24C48.0476 24 48.0476 16.14 47.044 12.3709Z" fill="#FF0302"></path><path d="M19.1385 31.1373V16.8628L31.684 24.0001L19.1385 31.1373Z" fill="#FEFEFE"></path></svg></span></div>  ');
        $("#youtubePlaceHolder").css('background-color','lightgrey')
        $('#alertYoutube').show()
        $('#titleYtube').val('')
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
    })
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
            btnImg.style.backgroundImage = url
            setTimeout(async () => {
                if(key != 'Avatar' && key != 'Background'){
                    const reportDataElement = document.getElementById('blocks')
                    const reportDataString = reportDataElement.textContent
                    const blocks = await JSON.parse(reportDataString)
                    const bioLink = $('#bioLink').val()
                    for (const data of blocks) {
                        if(data.short == short){
                            data.img = img
                        }
                    }
                    const data = {oldShort : bioLink, short: bioLink, blocks }
                    await fetchAPI('/api/biolink/edit', 'POST', data, 'Something wrong while editing image!', '?build')
                }else{
                    window.location.href = location;
                    location.load()
                }
                
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

async function btnDeleteImg(e) {  
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
    if(type == 'img'){
        const reportDataElement = document.getElementById('blocks')
        const reportDataString = reportDataElement.textContent
        const blocks = await JSON.parse(reportDataString)
        const bioLink = $('#bioLink').val()
        for (const data of blocks) {
            if(data.short == short){
                data.img = ''
            }
        }
        const bioData = {oldShort : bioLink, short: bioLink, blocks }
        fetchAPI('/api/biolink/edit', 'POST', bioData, 'Something wrong while deleting image!', '?build')
    }
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
    if(urlShort == 'qr' || urlShort == 'login' || urlShort == 'register' || urlShort =='url' || urlShort == 'biolink' || urlShort == 'm' || urlShort == 'plan' || urlShort == 'user' || urlShort == 'analytic' || urlShort == 'admin' || urlShort == 'view'){
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
    if(type == 'spotify') pattern = new RegExp(/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]{22}$/)
    if(type == 'soundcloud') pattern = new RegExp(/^https:\/\/soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/)
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

function getData() {  
    const reportDataElement = document.getElementById('reportData');
    const reportDataString = reportDataElement.textContent;
    const reportData = JSON.parse(reportDataString);
    console.log(reportData);
    const data = []
    const groupedData = {};
    for (const iterator of reportData) {
        if(iterator.logClicks){
            for (const logData of iterator.logClicks) {
                data.push(logData)
            }
        }
    }
    data.forEach(item => {
        const { date, click, device, countryList } = item;

        if (!groupedData[date]) {
            groupedData[date] = {
                date: date,
                totalClick: click,
                deviceClicks: [{type: 'mobile' , click: 0},{type: 'tablet' , click: 0},{type: 'desktop' , click: 0}],
                countryClicks: []
            };
        } else {
            groupedData[date].totalClick += click;
        }

        // Combine device clicks
        device.forEach(dev => {
            for (const iterator of groupedData[date].deviceClicks) {
                if(dev.type == iterator.type){
                    iterator.click += dev.click
                }
            }
        });

        // Combine country clicks
        countryList.forEach(country => {
            var found = false
            for (const iterator of groupedData[date].countryClicks) {
                if(iterator.country == country.country){
                    iterator.click += country.click
                    found = true
                }
            }
            if(!found){
                const countryName = country.country
                const countryClick = country.click
                groupedData[date].countryClicks.push({country: countryName, click: countryClick})
            }
        });
    });
    console.log(Object.values(groupedData));
    return Object.values(groupedData)
}

function loadData(rawReport, filter) {  
    var lineChartData = new Array(7).fill(0);
    var pieChartData = new Array(3).fill(0);
    var tableData = []
    let totalClicks = 0;
    var labelDate = filter.dateFrom ? generateNext7Days(filter.dateFrom) : generateLast7Days(new Date())
    rawReport.forEach(item => {
        for (let index = 0; index < labelDate.length; index++) {
            if(labelDate[index] == item.date){
                lineChartData[index] = item.totalClick
                console.log('item', item);
                for (const country of item.countryClicks) {
                    var found = false 
                    for (const iterator of tableData) {
                        if(iterator.country == country.country){
                            found = true 
                            iterator.click += country.click
                        }
                    }
                    if(!found){
                        tableData.push({country: country.country, click: country.click})
                    }
                }
                for (const object of item.deviceClicks) {
                    if(object.type == 'mobile') pieChartData[0] += object.click
                    if(object.type == 'tablet') pieChartData[1] += object.click
                    if(object.type == 'desktop') pieChartData[2] += object.click
                    console.log(object);
                }
                totalClicks += item.totalClick
            }
        }
    });
    
    const dataLineChart = {
        labels: labelDate,
        datasets: [{
            label: 'Clicks',
            data: lineChartData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    }
    const dataPieChart = {
        labels: ['Mobile', 'Tablet', 'Desktop'],
        datasets: [{
            label: 'clicks',
            data: pieChartData,
            backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
            ],
            hoverOffset: 4  
        }]
    }
    const canvasLineChart = document.getElementById('lineChart').getContext('2d');
    const canvasPieChart = document.getElementById('pieChart').getContext('2d');
    if(Chart.getChart('lineChart') != undefined) Chart.getChart('lineChart').destroy()
    if(Chart.getChart('pieChart') != undefined) Chart.getChart('pieChart').destroy()
    const lineChart = new Chart(canvasLineChart, {
        type: 'line',
        data: dataLineChart
    });

    const pieChart = new Chart(canvasPieChart, {
        type: 'pie',
        data: dataPieChart,
        options: {   
            plugins: {
            legend: {
                display: true,
                position: 'right'
            }
            }
        }
    });
    var ctr = 1
    var htmlSyntax = ''
    tableData.forEach(item=>{
        htmlSyntax += '<tr><td>'+ctr+'</td>'+'<td>'+item.country+'</td>'+'<td>'+item.click+'</td></tr>'
        ctr++
    })
    const countryBodyTable = $('#countryBodyTable').html(htmlSyntax)
    new DataTable('#countryTable')
    new DataTable('#linkTable')
}


function generateLast7Days(dateFilter) {
    const labels = []
    for (let i = 6; i >= 0; i--) {
    const date = new Date(dateFilter)
    date.setDate(dateFilter.getDate() - i)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    labels.push(`${month}/${day}/${year}`)
    }
    return labels;
}

function generateNext7Days(dateFilter) {
    const labels = []
    for (let i = 0; i <= 6; i++) {
        const date = new Date(dateFilter)
        date.setDate(dateFilter.getDate() + i)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const year = date.getFullYear()
        labels.push(`${month}/${day}/${year}`)
    }
    return labels;
}


async function dateChange(e){
    const dateAnchor =  $(e).val();
    const filter = {}
    filter.dateFrom = new Date(dateAnchor)
    loadData(getData(), filter)
}