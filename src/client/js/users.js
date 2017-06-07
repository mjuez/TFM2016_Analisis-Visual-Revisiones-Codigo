function loadUsersList(apiRoute, page, url) {
    showLoader();
    $('#users_order_dropdown').dropdown({
        onChange: function (value, text) { handleUsersOrder(value); }
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

function handleUsersOrder(value) {
    switch (value) {
        case 'date_asc':
            app.setLocation(`#/users/order/date/asc/page/1`);
            break;
        case 'date_desc':
            app.setLocation(`#/users/order/date/desc/page/1`);
            break;
        case 'name_asc':
            app.setLocation(`#/users/order/name/asc/page/1`);
            break;
        case 'name_desc':
            app.setLocation(`#/users/order/name/desc/page/1`);
            break;
        case 'pulls_asc':
            app.setLocation(`#/users/order/pullrequests/asc/page/1`);
            break;
        case 'pulls_desc':
            app.setLocation(`#/users/order/pullrequests/desc/page/1`);
            break;
        case 'reviews_asc':
            app.setLocation(`#/users/order/reviews/asc/page/1`);
            break;
        case 'reviews_desc':
            app.setLocation(`#/users/order/reviews/desc/page/1`);
            break;
        case 'approved_reviews_asc':
            app.setLocation(`#/users/order/reviews/approved/asc/page/1`);
            break;
        case 'approved_reviews_desc':
            app.setLocation(`#/users/order/reviews/approved/desc/page/1`);
            break;
        case 'commented_reviews_asc':
            app.setLocation(`#/users/order/reviews/commented/asc/page/1`);
            break;
        case 'commented_reviews_desc':
            app.setLocation(`#/users/order/reviews/commented/desc/page/1`);
            break;
        case 'changes_requested_reviews_asc':
            app.setLocation(`#/users/order/reviews/changes_requested/asc/page/1`);
            break;
        case 'changes_requested_reviews_desc':
            app.setLocation(`#/users/order/reviews/changes_requested/desc/page/1`);
            break;
        case 'dismissed_reviews_asc':
            app.setLocation(`#/users/order/reviews/dismissed/asc/page/1`);
            break;
        case 'dismissed_reviews_desc':
            app.setLocation(`#/users/order/reviews/dismissed/desc/page/1`);
            break;
        case 'review_comments_asc':
            app.setLocation(`#/users/order/reviewcomments/asc/page/1`);
            break;
        case 'review_comments_desc':
            app.setLocation(`#/users/order/reviewcomments/desc/page/1`);
            break;
    }
}

function loadUser(login) {
    showLoader();
    $.get(`/api/user/${login}`)
        .done(function (result) {
            $('#user_title').html(`Usuario: ${result.login}`);
            configureUserButtons(result);
            loadUserCharts(result);
            hideLoader();
        })
        .fail(function (error) {
            app.setLocation(`#/notfound`);
            hideLoader();
        });
}

function configureUserButtons(user) {
    $('#user_viewgithub_button').on('click', function(){
        $(location).attr('href', user.html_url);
    });
}

function loadUserCharts(user) {
    $.get(`/api/users/stats/means`)
        .done(function (result) {
            printUserMeanCharts(user, result);
            printUserReviewTypesChart(user);
        })
        .fail(function (error) {
            // todo
        });
}

function printUserMeanCharts(user, meanData) {
    var pullsCountConfig = {
        value: user.pull_request_count,
        mean: meanData.pull_request_count,
        container: 'user_pullrequests_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de pull request creadas'
    };
    printUserMeanChart(pullsCountConfig);
    var reviewsCountConfig = {
        value: user.reviews_count,
        mean: meanData.reviews_count,
        container: 'user_reviews_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de revisiones realizadas'
    };
    printUserMeanChart(reviewsCountConfig);
    var reviewCommentsCountConfig = {
        value: user.review_comments_count,
        mean: meanData.review_comments_count,
        container: 'user_reviewcomments_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de comentarios de revisión realizados'
    };
    printUserMeanChart(reviewCommentsCountConfig);
}

function printUserReviewTypesChart(user){
    $(`#user_reviewtypes_chart_segment`).removeClass('loading');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#user_reviewtypes_chart`,
        data: {
            columns: [
                ['Comentadas', user.reviews_commented_count],
                ['Con petición de cambios', user.reviews_changes_requested_count],
                ['Aprobadas', user.reviews_approved_count],
                ['Descartadas', user.reviews_dismissed_count]
            ],
            type: 'donut'
        },
        donut: {
            title: 'Revisiones'
        }
    });
}

function printUserMeanChart(config) {
    $(`#${config.container}_segment`).removeClass('loading');
    var data = ['data1', config.value];
    var meanData = ['data2', config.mean];
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#${config.container}`,
        data: {
            columns: [
                data,
                meanData
            ],
            type: 'bar',
            names: {
                data1: `${config.column_legend}`,
                data2: `Media`
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: ['muestras']
            },
            y: {
                label: config.y_label
            }
        }
    });
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
                        userData.pull_request_count
                    ]
                })
            ]
        })
    });

    return item;
}