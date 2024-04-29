function btnSearchDate(e) {  
    const dateFrom = $('#dateFrom').val()
    const dateTo = $('#dateTo').val()
    const status = $('#transStatus').val()
    var location = '?df=' + dateFrom +'&dt=' + dateTo+ '&st=' + status
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

async function btnBuyAgain(e) {  
    var config = {method: "POST", headers: {"Content-Type": "application/json"}}
    const oldInvoiceId = $(e).attr('invoiceId')
    const oldInvoice = searchInvoice(oldInvoiceId)
    const items = oldInvoice.items
    const type = oldInvoice.type
    const planId = oldInvoice.planId
    const grandTotal = oldInvoice.grandTotal
    const data = {
        items,
        grandTotal,
        createdAt: new Date(),
        type,
        planId
    }
    config.body = JSON.stringify(data)
    const token = await fetch('/plan/createInvoice', config).then(async (response) => {
        const obj = await response.json()
        return obj.token
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
    snap.pay(token)
}

function btnSnap(token){
    snap.pay(token)
}

function searchInvoice(invoiceId) {  
    const reportDataElement = document.getElementById('reportData');
    const reportDataString = reportDataElement.textContent;
    const reportData = JSON.parse(reportDataString);
    for (const iterator of reportData) {
        if(iterator.invoiceId == invoiceId){
            return iterator
        }
    }
}

async function btnBuySubscriptionPlan(e) {  
    var config = {method: "POST", headers: {"Content-Type": "application/json"}}
    const planId = $(e).val()
    const name = $(e).attr('planName')
    const grandTotal = parseInt($(e).attr('price'))
    const data = {
        items: [{name, price: grandTotal, quantity: 1 ,type: 'plan' }],
        grandTotal,
        createdAt: new Date(),
        type:'plan',
        planId
    }
    config.body = JSON.stringify(data)
    const token = await fetch('/plan/createInvoice', config).then(async (response) => {
        const obj = await response.json()
        return await obj.token
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
    snap.pay(token)
}

function sortSubscriptionPlan(e) {  
    const sort = $(e).val()
    console.log(sort);
    window.location.href = '?'+sort
}