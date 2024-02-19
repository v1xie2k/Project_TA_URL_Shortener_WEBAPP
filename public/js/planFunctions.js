function btnIncreaseQty(e) {  
    const type = $(e).attr('category')
    const price = $(e).attr('price')
    var input = parseInt($('#ctr'+type).val())
    var newInput = input + 1
    var subtotal = newInput * price
    $('#ctr'+type).val(newInput)
    $('#subtotal'+type).html(subtotal)
    loadGrandTotal()
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
    const bioPrice = parseInt($('#ctrbiolink').attr('price'))
    const qrPrice = parseInt($('#ctrqr').attr('price'))
    const urlPrice = parseInt($('#ctrurl').attr('price'))
    const bioSub = (bioQty * bioPrice)
    const qrSub = (qrQty * qrPrice)
    const urlSub = (urlQty * urlPrice)
    var grandTotal = bioSub + urlSub + qrSub
    $('#grandTotal').html(grandTotal)
}

function btnClickBuy(e) {  
    const bio = $('#ctrbiolink').val()
    const url = $('#ctrqr').val()
    const qr = $('#ctrurl').val()
    const grandTotal = parseInt($('#grandTotal').html())
    //grandtotal sudah jalan tingal connect ke midtrans & tambahkan credit ke user
    console.log(bio);
    console.log(url);
    console.log(qr);
    const data = {
        bio,
        url,
        qr,
        grandTotal,
        createdAt: new Date()
    }
    console.log('grandTotal',grandTotal);
}