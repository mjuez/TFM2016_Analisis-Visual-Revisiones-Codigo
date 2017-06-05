function loadUserList(apiRoute, page, url) {
    showLoader();
    $('#users_order_dropdown').dropdown({
        onChange: function (value, text) { handleUsersOrder(value, page); }
    });
    $.get(apiRoute)
        .done(function (result) {
            printUserItems(result.data);
            let paginator = $('#user_paginator');
            printPaginator(paginator, page, result.last_page, url);
            hideLoader();
        })
        .fail(function (error) {
            $('#user_list').html('No se pueden obtener los repositorios en este momento.');
            hideLoader();
        });
}

function handleUsersOrder(value, page) {
    switch (value) {
        case 'date_asc':
            app.setLocation(`#/users/order/date/asc/page/${page}`);
            break;
        case 'date_desc':
            app.setLocation(`#/users/order/date/desc/page/${page}`);
            break;
        case 'name_asc':
            app.setLocation(`#/users/order/name/asc/page/${page}`);
            break;
        case 'name_desc':
            app.setLocation(`#/users/order/name/desc/page/${page}`);
            break;
        case 'pulls_asc':
            app.setLocation(`#/users/order/pullrequests/asc/page/${page}`);
            break;
        case 'pulls_desc':
            app.setLocation(`#/users/order/pullrequests/desc/page/${page}`);
            break;
        case 'reviews_asc':
            app.setLocation(`#/users/order/reviews/asc/page/${page}`);
            break;
        case 'reviews_desc':
            app.setLocation(`#/users/order/reviews/desc/page/${page}`);
            break;
        case 'accepted_reviews_asc':
            app.setLocation(`#/users/order/reviews/accepted/asc/page/${page}`);
            break;
        case 'accepted_reviews_desc':
            app.setLocation(`#/users/order/reviews/accepted/desc/page/${page}`);
            break;
        case 'commented_reviews_asc':
            app.setLocation(`#/users/order/reviews/commented/asc/page/${page}`);
            break;
        case 'commented_reviews_desc':
            app.setLocation(`#/users/order/reviews/commented/desc/page/${page}`);
            break;
        case 'changes_requested_reviews_asc':
            app.setLocation(`#/users/order/reviews/changes_requested/asc/page/${page}`);
            break;
        case 'changes_requested_reviews_desc':
            app.setLocation(`#/users/order/reviews/changes_requested/desc/page/${page}`);
            break;
        case 'dismissed_reviews_asc':
            app.setLocation(`#/users/order/reviews/dismissed/asc/page/${page}`);
            break;
        case 'dismissed_reviews_desc':
            app.setLocation(`#/users/order/reviews/dismissed/desc/page/${page}`);
            break;
    }
}