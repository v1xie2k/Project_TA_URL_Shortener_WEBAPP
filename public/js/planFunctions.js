function btnIncreaseQty(e) {  
    console.log('OI');
    const type = $(e).attr('category')
    const price = $(e).attr('price')
    var input = parseInt($('#ctr'+type).val())
    var newInput = input + 1
    var subtotal = newInput * price
    $('#ctr'+type).val(newInput)
    $('#subtotal'+type).html(subtotal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
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
    $('#subtotal'+type).html(subtotal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    loadGrandTotal()
}

function loadGrandTotal(){
    const bioQty = parseInt($('#ctrbiolink').val())
    const bioProQty = parseInt($('#ctrbioPro').val())
    const qrQty = parseInt($('#ctrqr').val())
    const urlQty = parseInt($('#ctrurl').val())
    const promptQty = parseInt($('#ctrprompt').val())
    const bioPrice = parseInt($('#ctrbiolink').attr('price'))
    const bioProPrice = parseInt($('#ctrbioPro').attr('price'))
    const qrPrice = parseInt($('#ctrqr').attr('price'))
    const urlPrice = parseInt($('#ctrurl').attr('price'))
    const promptPrice = parseInt($('#ctrprompt').attr('price'))
    const bioSub = (bioQty * bioPrice)
    const bioProSub = (bioProQty * bioProPrice)
    const qrSub = (qrQty * qrPrice)
    const urlSub = (urlQty * urlPrice)
    const promptSub = (promptQty * promptPrice)
    var grandTotal = bioSub + urlSub + qrSub + promptSub + bioProSub
    $('#grandTotal').html(grandTotal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    $('#subtotalbiolink').html(bioSub.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    $('#subtotalbioPro').html(bioProSub.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    $('#subtotalqr').html(qrSub.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    $('#subtotalurl').html(urlSub.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    $('#subtotalprompt').html(promptSub.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "."))
    if(grandTotal == 0) $('#btnClickBuy').attr('disabled', true)
}

async function btnClickBuy(e) {  
    var config = {method: "POST", headers: {"Content-Type": "application/json"}}
    const bioQty = parseInt($('#ctrbiolink').val())
    const bioProQty = parseInt($('#ctrbioPro').val())
    const qrQty = parseInt($('#ctrqr').val())
    const urlQty = parseInt($('#ctrurl').val())
    const promptQty = parseInt($('#ctrprompt').val())
    const grandTotal = parseInt($('#grandTotal').html())
    const bioPrice = parseInt($('#ctrbiolink').attr('price'))
    const bioProPrice = parseInt($('#ctrbioPro').attr('price'))
    const qrPrice = parseInt($('#ctrqr').attr('price'))
    const urlPrice = parseInt($('#ctrurl').attr('price'))
    const promptPrice = parseInt($('#ctrprompt').attr('price'))
    var items = []
    //grandtotal sudah jalan tingal connect ke midtrans & tambahkan credit ke user
    if(bioQty > 0) items.push({name: 'Bio Link', price: bioPrice, quantity: bioQty, type:'bio'})
    if(bioProQty > 0) items.push({name: 'Bio Link Pro', price: bioProPrice, quantity: bioProQty, type:'bioPro'})
    if(qrQty > 0) items.push({name: 'QR Code', price: qrPrice, quantity: qrQty, type: 'qr'})
    if(urlQty > 0) items.push({name: 'Short URL', price: urlPrice, quantity: urlQty, type: 'url'})
    if(promptQty > 0) items.push({name: 'Prompt', price: promptPrice, quantity: promptQty, type: 'prompt'})
    const data = {
        items,
        grandTotal,
        createdAt: new Date(),
        // status: 1,
        // paymentToken: null,
        type: 'customplan'
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
    console.log('grandTotal',grandTotal);
}