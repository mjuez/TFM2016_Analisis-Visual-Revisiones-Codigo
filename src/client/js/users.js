function loadUsers(callback) {
    $('#content').load(`/_users.html`, callback);
}