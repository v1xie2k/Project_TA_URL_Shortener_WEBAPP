var destination
if(window.location.href.split('/')[3] == 'url') destination = '/url'
if(window.location.href.split('/')[3] == 'qr') destination ='/qr'


function generateQr(elementId, shortUrl){
    new QRious({
        element: document.getElementById(elementId),
        value: "https://gamepal.my.id/" + shortUrl,
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
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
    var fullUrl = $('#fullUrl').val()
    const data = {type: 'prompt'}
    config.body = JSON.stringify(data)
    if(!fullUrl){
        Swal.fire("Destination must be filled first!");
    }else{
        fetch('/credential/checkCredit', config).then(async (response) => {
            if (response.ok) {
                Swal.fire({icon: "warning", title: "Prompting will cost you 1 credit! Are you sure about it?", showCancelButton: true, confirmButtonText: "Go"}).then(async (result) => {
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
                                fetch('/credential/reduceCredit', config).then(async (response) => {
                                    if (response.ok) {
                                        console.log('succcess');
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
                                Swal.fire({icon: "error", title: "Ooops....", text: "Something wrong"});
                            }
                            $('#promptBtn').html('Prompt')
                            $('#promptBtn').prop('disabled', false)
                        }).catch((error) => {
                            alert('WARNING!')
                            console.log(error);
                            $('#promptBtn').html('Prompt')
                            $('#promptBtn').prop('disabled', false)
                        })
                    }
                })
            }
            else if(response.status){
                Swal.fire({icon: "error", title: "Ooops....", text: 'Insufficient Credit!'});
            }
        }).catch((error) => {
            alert('WARNING!')
            console.log(error);
        });
    
        
    }
}

async function btnAddUrl(e) {
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
    
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
    config.body = JSON.stringify(data)
    fetch('/credential/checkCredit', config).then(async (response) => {
        if (response.ok) {
            fetch('/api/url', config).then(async (response) => {
                if (response.ok) {
                    fetch('/credential/reduceCredit', config).then(async (response) => {
                        if (response.ok) {
                            window.location.href = destination;
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
                    Swal.fire({icon: "error", title: "Ooops....", text: 'This Short URL is Already Taken!'});
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
    });
}

async function btnEditUrl(e) {
    var config = {method: 'POST', headers: {"Content-Type": "application/json"}}
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
    if(switchBtn) data.type = 'qr'
    if($(location).attr("href").split('/')[3] == 'qr') data.type = 'qr'
    config.body = JSON.stringify(data)
    if(checkShort || checkFull || switchBtn){
        Swal.fire({
            icon: "warning",
            title: "Adding QR Code, Changing Destination or Short Link will cost you 1 credit! Are you sure about it?",
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
                                        window.location.href = destination;
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
                                Swal.fire({icon: "error", title: "Ooops....", text: 'This Short URL is Already Taken!'});
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
                });
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
            Swal.fire({icon: "error", title: "Ooops....", text});
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
    if(urlShort == 'qr' || urlShort == 'login' || urlShort == 'register' || urlShort =='url' || urlShort == 'biolink' || urlShort == 'm' || urlShort == 'plan' || urlShort == 'user' || urlShort == 'analytic' || urlShort == 'admin' || urlShort == 'view'){
        return false
    }
    return true
}

function btnCopyClick(e){
    navigator.clipboard.writeText($(e).val());
}

function getData() {  
    const reportDataElement = document.getElementById('reportData');
    const reportDataString = reportDataElement.textContent;
    const reportData = JSON.parse(reportDataString);
    console.log(reportData);
    const data = []
    const groupedData = {}
    if(reportData.logClicks){
        for (const logData of reportData.logClicks) {
            data.push(logData)
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
    console.log(pieChartData);
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
    new DataTable('#referrerTable')
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