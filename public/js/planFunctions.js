function btnIncreaseQty(e) {  
    const type = $(e).attr('category')
    const price = $(e).attr('price')
    var input = parseInt($('#ctr'+type).val())
    var newInput = input + 1
    var subtotal = newInput * price
    $('#ctr'+type).val(newInput)
    $('#subtotal'+type).html(subtotal)
    loadGrandTotal()
    $('#btnClickBuy').attr('disabled', false)
}

function btnDecreaseQty(e) {  
    const type = $(e).attr('category')
    const price = $(e).attr('price')
    var input = parseInt($('#ctr'+type).val())
    var newInput = input - 1
    if(newInput < 0) newInput = 0
    var subtotal = newInput * price
    $('#ctr'+type).val(newInput)
    $('#subtotal'+type).html(subtotal)
    loadGrandTotal()
}

function loadGrandTotal(){
    const bioQty = parseInt($('#ctrbiolink').val())
    const qrQty = parseInt($('#ctrqr').val())
    const urlQty = parseInt($('#ctrurl').val())
    const promptQty = parseInt($('#ctrprompt').val())
    const bioPrice = parseInt($('#ctrbiolink').attr('price'))
    const qrPrice = parseInt($('#ctrqr').attr('price'))
    const urlPrice = parseInt($('#ctrurl').attr('price'))
    const promptPrice = parseInt($('#ctrprompt').attr('price'))
    const bioSub = (bioQty * bioPrice)
    const qrSub = (qrQty * qrPrice)
    const urlSub = (urlQty * urlPrice)
    const promptSub = (promptQty * promptPrice)
    var grandTotal = bioSub + urlSub + qrSub + promptSub
    $('#grandTotal').html(grandTotal)
    $('#subtotalbiolink').html(bioSub)
    $('#subtotalqr').html(qrSub)
    $('#subtotalurl').html(urlSub)
    $('#subtotalprompt').html(promptSub)
    if(grandTotal == 0) $('#btnClickBuy').attr('disabled', true)
}

async function btnClickBuy(e) {  
    var config = {method: "POST", headers: {"Content-Type": "application/json"}}
    const bioQty = parseInt($('#ctrbiolink').val())
    const qrQty = parseInt($('#ctrqr').val())
    const urlQty = parseInt($('#ctrurl').val())
    const promptQty = parseInt($('#ctrprompt').val())
    const grandTotal = parseInt($('#grandTotal').html())
    const bioPrice = parseInt($('#ctrbiolink').attr('price'))
    const qrPrice = parseInt($('#ctrqr').attr('price'))
    const urlPrice = parseInt($('#ctrurl').attr('price'))
    const promptPrice = parseInt($('#ctrprompt').attr('price'))
    var items = []
    //grandtotal sudah jalan tingal connect ke midtrans & tambahkan credit ke user
    if(bioQty > 0) items.push({name: 'Bio Link', price: bioPrice, quantity: bioQty, type:'bio'})
    if(qrQty > 0) items.push({name: 'QR Code', price: qrPrice, quantity: qrQty, type: 'qr'})
    if(urlQty > 0) items.push({name: 'Short URL', price: urlPrice, quantity: urlQty, type: 'url'})
    if(promptQty > 0) items.push({name: 'Prompt', price: promptPrice, quantity: promptQty, type: 'prompt'})
    const data = {
        items,
        grandTotal,
        createdAt: new Date(),
        status: 1,
        paymentToken: null,
        type: 'customplan'
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