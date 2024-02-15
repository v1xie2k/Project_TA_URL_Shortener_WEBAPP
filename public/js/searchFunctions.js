function searchUrl() {
    var value = $('#myInput').val()
    var url = window.location.href.split('/')[3]
    var type = url.split('?')[0]
    var newUrl = '/' + type + '?' + value
    window.location.href = newUrl;
 }