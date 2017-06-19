/**
 * users.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/**
 * Users list loader.
 * 
 * @param {string} apiRoute     Anvireco GET api route.
 * @param {number} page         page number.
 * @param {string} url          base url.
 */
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

/**
 * Handles user ordering.
 * 
 * @param {string} value    order value. 
 */
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

/**
 * Loads a single user page.
 * 
 * @param {string} login    user login.
 */
function loadUser(login) {
    showLoader();
    $.get(`/api/user/${login}`)
        .done(function (result) {
            $('#user_title').html(`Usuario: ${result.name} (@${result.login})`);
            configureUserButtons(result);
            loadUserCharts(result);
            hideLoader();
        })
        .fail(function (error) {
            app.setLocation(`#/notfound`);
            hideLoader();
        });
}

/**
 * Configures the top buttons of a single user page.
 * 
 * @param {Object} user user object.
 */
function configureUserButtons(user) {
    $('#user_viewgithub_button').on('click', function () {
        $(location).attr('href', user.html_url);
    });
}

/**
 * Loads a single user charts.
 * 
 * @param {Object} user user object
 */
function loadUserCharts(user) {
    $.get(`/api/users/stats/means`)
        .done(function (result) {
            printUserMeanCharts(user, result);
        });

    if (user.reviews_count > 0) {
        $.get(`/api/reviews/filter/user/${user.login}/stats/alltime`)
            .done(function (result) {
                printUserReviewsAllTimeChart(result);
                printUserReviewTypesChart(user);
            });
    } else {
        $('#user_reviews_none_msg').removeClass("invisible");
        $('#user_reviewtypes_chart_segment').addClass("invisible");
        $('#user_reviews_alltime_chart_segment').addClass("invisible");
    }

    if (user.pull_request_count > 0) {
        $.get(`/api/pulls/filter/user/${user.login}/stats/alltime`)
            .done(function (result) {
                printUserPullsStatesChart(result);
                printUserPullsAllTimeChart(result);
            });
    } else {
        $('#user_pulls_none_msg').removeClass("invisible");
        $('#user_pullsstates_chart_segment').addClass("invisible");
        $('#user_pulls_alltime_chart_segment').addClass("invisible");
    }

    if (user.review_comments_count > 0) {
        $.get(`/api/reviewcomments/filter/user/${user.login}/stats/alltime`)
            .done(function (result) {
                printUserReviewCommentsAllTimeChart(result);
            });
    } else {
        $('#user_reviewcomments_none_msg').removeClass("invisible");
        $('#user_reviewcomments_alltime_chart_segment').addClass("invisible");
    }

}

/**
 * Prints all user mean charts.
 * 
 * @param {Object} user     user object
 * @param {Object} meanData mean statistics.
 */
function printUserMeanCharts(user, meanData) {
    var pullsCountConfig = {
        value: user.pull_request_count,
        mean: meanData.pull_request_count,
        container: 'user_pullrequests_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de pull request creadas'
    };
    printMeanChart(pullsCountConfig);
    var reviewsCountConfig = {
        value: user.reviews_count,
        mean: meanData.reviews_count,
        container: 'user_reviews_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de revisiones realizadas'
    };
    printMeanChart(reviewsCountConfig);
    var reviewCommentsCountConfig = {
        value: user.review_comments_count,
        mean: meanData.review_comments_count,
        container: 'user_reviewcomments_chart',
        column_legend: `Usuario: ${user.login}`,
        y_label: 'Número de comentarios de revisión realizados'
    };
    printMeanChart(reviewCommentsCountConfig);
}

/**
 * Prints a donut chart with review types comparison.
 * 
 * @param {Object} stats    Review types statistics.
 */
function printUserReviewTypesChart(user) {
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

/**
 * Prints an area chart of all time 
 * reviews statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printUserReviewsAllTimeChart(stats) {
    $(`#user_reviews_alltime_chart_segment`).removeClass('loading');
    stats.all.unshift('all');
    stats.approved.unshift('approved');
    stats.changes_requested.unshift('changes_requested');
    stats.commented.unshift('commented');
    stats.dismissed.unshift('dismissed');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#user_reviews_alltime_chart`,
        data: {
            columns: [
                stats.commented,
                stats.changes_requested,
                stats.approved,
                stats.dismissed,
                stats.all
            ],
            type: 'area',
            names: {
                all: 'Todas',
                approved: 'Aprobadas',
                changes_requested: 'Con petición de cambios',
                commented: 'Comentadas',
                dismissed: 'Descartadas',
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: stats.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de revisiones',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints a donut chart with pull request
 * state comparison (open/closed).
 * 
 * @param {Object} stats open/closed statistics.
 */
function printUserPullsStatesChart(stats) {
    $(`#user_pullsstates_chart_segment`).removeClass('loading');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#user_pullsstates_chart`,
        data: {
            columns: [
                ['Abiertas', stats.open],
                ['Cerradas', stats.closed]
            ],
            type: 'donut',
            colors: {
                Abiertas: '#2ca02c',
                Cerradas: '#d62728'
            }
        },
        donut: {
            title: 'Pull Requests'
        }
    });
}

/**
 * Prints an area chart of all time 
 * pull requests statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printUserPullsAllTimeChart(stats) {
    $(`#user_pulls_alltime_chart_segment`).removeClass('loading');
    stats.created.unshift('created');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#user_pulls_alltime_chart`,
        data: {
            columns: [
                stats.created
            ],
            type: 'area',
            names: {
                created: 'Creadas'
            },
            colors: {
                created: '#9467bd'
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: stats.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de pull requests',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints an area chart of all time 
 * review comments statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printUserReviewCommentsAllTimeChart(stats) {
    $(`#user_reviewcomments_alltime_chart_segment`).removeClass('loading');
    stats.created.unshift('created');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#user_reviewcomments_alltime_chart`,
        data: {
            columns: [
                stats.created
            ],
            type: 'area',
            names: {
                created: 'Creados'
            },
            colors: {
                created: '#9467bd'
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: stats.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de comentarios de revisión',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints the list of users.
 * 
 * @param {Array} items users items.
 */
function printUserItems(items) {
    $('#user_list').html('');
    items.map(function (item) {
        $('#user_list').append(userItem(item));
    });
}

/**
 * Creates a user list item.
 * 
 * @param {Object} userData user data object.
 */
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