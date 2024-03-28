function btnSearchDate(e) {  
    const dateFrom = $('#dateFrom').val()
    const dateTo = $('#dateTo').val()
    var location = '?df=' + dateFrom +'&dt=' + dateTo
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
    console.log(oldInvoice);
    const items = oldInvoice.items
    const type = oldInvoice.type
    const grandTotal = oldInvoice.grandTotal
    const data = {
        items,
        grandTotal,
        createdAt: new Date(),
        status: 1,
        paymentToken: null,
        type
    }
    //step 1 create invoice
    config.body = JSON.stringify(data)
    const invoiceId = await fetch('/plan/createInvoice', config).then(async (response) => {
        return await response.text()
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
    const parameter = {
        'transaction_details': {
            'order_id': invoiceId,
            'gross_amount': grandTotal,
        },
        "item_details": items
    }
    //step 2 generate token
    config.body = JSON.stringify(parameter)
    const token = await fetch('/plan/getToken', config).then(async (response) => {
        return await response.text()
    }).catch((error) => {
        alert('WARNING!something wrong!')
        console.log(error);
    });
    // console.log('token', token);
    snap.pay(token, {
        onSuccess: async function(result){
            //step 3 update invoice diisi token baru & status
            data.status = 2
            data.paymentToken = token
            config.body = JSON.stringify(data)
            const confirmPayment = await fetch('/plan/updateInvoice/'+ invoiceId, config).then(async (response) => {
                return await response.text()
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
            window.location = '?'
        },
        onPending: function(result){
            console.log("pending", result);
        },
        onError: function(result){
            console.log("error", result);

        },
        onClose: async function (result) {
            config.method = 'DELETE'
            const cancelPayment = await fetch('/plan/deleteInvoice/'+ invoiceId, config).then(async (response) => {
                return await response.text()
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
            console.log("close", result);
            failAlert('Payment not finished')
        }
    })
    console.log('grandTotal',grandTotal);



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
    const urlQty = parseInt($(e).attr('url'))
    const qrQty = parseInt($(e).attr('qr'))
    const bioQty = parseInt($(e).attr('bio'))
    const bioProQty = parseInt($(e).attr('bioPro'))
    const promptQty = parseInt($(e).attr('prompt'))
    var items = []
    if(bioQty > 0) items.push({name: 'Bio Link',  price: 0, quantity: bioQty, type:'bio'})
    if(bioProQty > 0) items.push({name: 'Bio Link Pro',  price: 0, quantity: bioProQty, type:'bioPro'})
    if(qrQty > 0) items.push({name: 'QR Code',  price: 0, quantity: qrQty, type: 'qr'})
    if(urlQty > 0) items.push({name: 'Short URL',  price: 0, quantity: urlQty, type: 'url'})
    if(promptQty > 0) items.push({name: 'Prompt',  price: 0, quantity: promptQty, type: 'prompt'})
    const data = {
        items,
        grandTotal,
        createdAt: new Date(),
        status: 1,
        paymentToken: null,
        type:'plan',
        planId
    }
    config.body = JSON.stringify(data)
    const invoiceId = await fetch('/plan/createInvoice', config).then(async (response) => {
        return await response.text()
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
    const parameter = {
        'transaction_details': {
            'order_id': invoiceId,
            'gross_amount': grandTotal,
        },
        "item_details": {name, price: grandTotal, quantity: 1 ,type: 'plan' }
    }
    //step 2 generate token
    config.body = JSON.stringify(parameter)
    const token = await fetch('/plan/getToken', config).then(async (response) => {
        return await response.text()
    }).catch((error) => {
        alert('WARNING!something wrong!')
        console.log(error);
    });
    snap.pay(token, {
        onSuccess: async function(result){
            //step 3 update invoice diisi token baru & status
            data.status = 2
            data.paymentToken = token
            config.body = JSON.stringify(data)
            const confirmPayment = await fetch('/plan/updateInvoice/'+ invoiceId, config).then(async (response) => {
                return await response.text()
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
            window.location = '?'
        },
        onPending: function(result){
            console.log("pending", result);
        },
        onError: function(result){
            console.log("error", result);

        },
        onClose: async function (result) {
            config.method = 'DELETE'
            const cancelPayment = await fetch('/plan/deleteInvoice/'+ invoiceId, config).then(async (response) => {
                return await response.text()
            }).catch((error) => {
                alert('WARNING!')
                console.log(error);
            });
            console.log("close", result);
            failAlert('Payment not finished')
        }
    })
    console.log('grandTotal',grandTotal);
}

function sortSubscriptionPlan(e) {  
    const sort = $(e).val()
    console.log(sort);
    window.location.href = '?'+sort
}