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
    const bioProQty = parseInt($('#qtyBioPro').val())
    const data = {name, price, url: urlQty, qr: qrQty, prompt: promptQty, bio: bioQty, bioPro: bioProQty, createdAt: new Date()}
    if(!name || !planPrice){
        Swal.fire("Price & Description must be filled");
        return
    }
    if(urlQty == 0 && qrQty == 0 && promptQty == 0 && bioQty == 0 && bioProQty == 0){
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
    const bioPro = $(e).attr('bioPro')
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
    $('#qtyBioPro').val(bioPro)
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
    $('#qtyBioPro').val(0)
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

function getData() {  
    const reportUrl = JSON.parse(document.getElementById('reportUrl').textContent)
    const reportQr = JSON.parse(document.getElementById('reportQr').textContent)
    const reportBio = JSON.parse(document.getElementById('reportBio').textContent)
    const data = {url: [], bio: [], qr: []}
    var groupedData = {}
    reportUrl.forEach(item => {
        const date = moment(item.createdAt).format('l')
        if (!groupedData[date]) {
            groupedData[date] = {
                date: date,
                totalCreated: 1,
            };
        } else {
            groupedData[date].totalCreated += 1;
        }
    })
    data.url = Object.values(groupedData)
    groupedData = {}

    reportQr.forEach(item => {
        const date = moment(item.createdAt).format('l')
        if (!groupedData[date]) {
            groupedData[date] = {
                date: date,
                totalCreated: 1,
            };
        } else {
            groupedData[date].totalCreated += 1;
        }
    })
    data.qr = Object.values(groupedData)
    groupedData = {}
    reportBio.forEach(item => {
        const date = moment(item.createdAt).format('l')
        if (!groupedData[date]) {
            groupedData[date] = {
                date: date,
                totalCreated: 1,
            };
        } else {
            groupedData[date].totalCreated += 1;
        }
    })
    data.bio = Object.values(groupedData)

    return data
}

function loadData(rawReport, filter) {  
    var lineChartUrl = new Array(7).fill(0)
    var lineChartBio = new Array(7).fill(0)
    var lineChartQr = new Array(7).fill(0)
    let totalCreateds = 0
    var labelDate = filter.dateFrom ? generateNext7Days(filter.dateFrom) : generateLast7Days(new Date())
    for (let index = 0; index < labelDate.length; index++) {
        for (const item of rawReport.url) {
            if(labelDate[index] == item.date){
                lineChartUrl[index] = item.totalCreated
                totalCreateds += item.totalCreated
            }
        }
        for (const item of rawReport.bio) {
            if(labelDate[index] == item.date){
                lineChartBio[index] = item.totalCreated
                totalCreateds += item.totalCreated
            }
        }
        for (const item of rawReport.qr) {
            if(labelDate[index] == item.date){
                lineChartQr[index] = item.totalCreated
                totalCreateds += item.totalCreated
            }
        }
    }
    console.log(lineChartUrl);

    const dataLineChart = {
        labels: labelDate,
        datasets: [{
            label: 'Short Link',
            data: lineChartUrl,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }, {
            label: 'QR Code',
            data: lineChartQr,
            backgroundColor: 'rgba(113, 172, 105, 0.2)',
            borderColor: 'rgba(113, 172, 105, 1)',
            borderWidth: 1
        }, {
            label: 'Bio Link',
            data: lineChartBio,
            backgroundColor: 'rgba(194, 62, 235, 0.2)',
            borderColor: 'rgba(194, 62, 235, 1)',
            borderWidth: 1
        }]
    }
    const canvasLineChart = document.getElementById('lineChart').getContext('2d')
    if(Chart.getChart('lineChart') != undefined) Chart.getChart('lineChart').destroy()
    const lineChart = new Chart(canvasLineChart, {
        type: 'line',
        data: dataLineChart
    })
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
        console.log(dateFilter.getDate());
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

function loadIncomeData() {
    const rawReport = JSON.parse(document.getElementById('reportIncome').textContent)
    var dateFrom = $('#dateFrom').val()
    var dateTo = $('#dateTo').val()
    var planType = $('#planType').val()
    var labelDate = generateIncomeDate(dateFrom, dateTo)
    var lineChartNormal= new Array(labelDate.length).fill(0)
    var lineChartCustom = new Array(labelDate.length).fill(0)

    console.log(rawReport);
    for (let index = 0; index < labelDate.length; index++) {
        const dateNow = labelDate[index]
        for (const item of rawReport.incomeData) {
            
            const createdAt = moment(item.createdAt).format('l')
            console.log('dateNow', dateNow);
            console.log('createdAt', createdAt);
            if(createdAt == dateNow){
                if(item.type == 'plan'){
                    lineChartNormal[index] = item.grandTotal
                }else{
                    lineChartCustom[index] = item.grandTotal
                }
            }
        }
    }
    const datasets = [{
            label: 'Normal Plan',
            data: lineChartNormal,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }, {
            label: 'Custom Plan',
            data: lineChartCustom,
            backgroundColor: 'rgba(113, 172, 105, 0.2)',
            borderColor: 'rgba(113, 172, 105, 1)',
            borderWidth: 1
        }]
    console.log(datasets)
    if(planType == 1) datasets.pop()
    else if(planType == 2) datasets.shift()
    console.log('newds',datasets);
    const dataLineChart = {
        labels: labelDate,
        datasets
    }
    const canvasLineChart = document.getElementById('incomeChart').getContext('2d')
    if(Chart.getChart('incomeChart') != undefined) Chart.getChart('incomeChart').destroy()
    const incomeChart = new Chart(canvasLineChart, {
        type: 'line',
        data: dataLineChart
    })
}

function generateIncomeDate(dateFrom, dateTo) {
    var dateFrom = new Date(dateFrom)
    var dateTo = new Date(dateTo)
    var labels = []
    var currentDate = new Date(dateFrom)
    dateFrom.setDate(dateFrom.getDate()-1)
    while(currentDate.toDateString() != dateTo.toDateString()){
        const date = dateFrom
        date.setDate(dateFrom.getDate() + 1)
        currentDate.setDate(currentDate.getDate() + 1);
        const month = date.getMonth() + 1
        const day = date.getDate()
        const year = date.getFullYear()
        labels.push(`${month}/${day}/${year}`)
    }
    console.log(labels);
    return labels;
}

function btnSearchDate(e) {  
    const dateFrom = $('#dateFrom').val()
    const dateTo = $('#dateTo').val()
    const planType = $('#planType').val()
    var location = '?df=' + dateFrom +'&dt=' + dateTo +'&type='+planType
    if(dateFrom > dateTo){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Start date mustn't greater than end date!",
        });
        return
    }
    window.location.href = location

}