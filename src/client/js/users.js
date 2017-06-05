function loadUsersList(apiRoute, page, url) {
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
            $('#user_list').html('No se pueden obtener los usuarios en este momento.');
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
        case 'review_comments_asc':
            app.setLocation(`#/users/order/reviewcomments/asc/page/${page}`);
            break;
        case 'review_comments_desc':
            app.setLocation(`#/users/order/reviewcomments/desc/page/${page}`);
            break;
    }
}

function printUserItems(items) {
    $('#user_list').html('');
    items.map(function (item) {
        $('#user_list').append(userItem(item));
    });
}

function userItem(userData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<a>', {
                    text: userData.login,
                    class: 'header',
                    href: `/#/user/${userData.login}`
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: userData.name
                    })
                }),
                ,
                $('<div>', {
                    class: 'extra',
                    html: [
                        $('<i>', {
                            class: 'unhide icon'
                        }),
                        userData.reviews_count,
                        ' (',
                        $('<i>', {
                            class: 'checkmark icon'
                        }),
                        userData.reviews_approved_count,
                        ', ',
                        $('<i>', {
                            class: 'talk icon'
                        }),
                        userData.reviews_commented_count,
                        ', ',
                        $('<i>', {
                            class: 'remove icon'
                        }),
                        userData.reviews_changes_requested_count,
                        ', ',
                        $('<i>', {
                            class: 'trash icon'
                        }),
                        userData.reviews_dismissed_count,
                        ') ',
                        ' | ',
                        $('<i>', {
                            class: 'comments icon'
                        }),
                        userData.review_comments_count,
                        ' | ',
                        $('<i>', {
                            class: 'fork icon'
                        }),
                        userData.pull_requests_count
                    ]
                })
            ]
        })
    });

    return item;
}