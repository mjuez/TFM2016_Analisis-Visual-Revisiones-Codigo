function loadPullrequests(callback) {
    $('#content').load(`/_pullrequests.html`, callback);
}