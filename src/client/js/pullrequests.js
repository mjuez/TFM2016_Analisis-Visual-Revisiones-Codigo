function loadPullrequestsList(apiRoute, page, url, repository = undefined) {
    showLoader();
    $('#pullrequests_order_dropdown').dropdown({
        onChange: function (value, text) { handlePullrequestsOrder(value, repository); }
    });
    configurePullrequestsFilter(page);
    $.get(apiRoute)
        .done(function (result) {
            printPullRequestItems(result.data);
            let paginator = $('#pullrequest_paginator');
            printPaginator(paginator, page, result.last_page, url);
            hideLoader();
        })
        .fail(function (error) {
            $('#pullrequest_list').html('No se pueden obtener los repositorios en este momento.');
            hideLoader();
        });
}

function handlePullrequestsOrder(value, repository) {
    var repositoryFilter = '';
    if (repository != undefined) {
        repositoryFilter = `filter/${repository.owner}/${repository.name}/`;
    }
    switch (value) {
        case 'date_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/date/asc/page/1`);
            break;
        case 'date_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/date/desc/page/1`);
            break;
        case 'name_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/name/asc/page/1`);
            break;
        case 'name_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/name/desc/page/1`);
            break;
        case 'reviews_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/reviews/asc/page/1`);
            break;
        case 'reviews_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/reviews/desc/page/1`);
            break;
    }
}

function configurePullrequestsFilter(page, repository) {
    $('#pullrequests_filter_repositories').html('');
    $.get(`/api/repos/all`)
        .done(function (result) {
            result.map(function (repo) {
                var item = $('<div>', {
                    class: 'item',
                    "data-value": repo,
                    html: repo
                });
                $('#pullrequests_filter_repositories').append(item);
            });

            if (repository != undefined) {
                $('#pullrequests_filter_dropdown').dropdown('set selected', `${repository.owner}/${repository.name}`);
            }

            $('#pullrequests_filter_dropdown').dropdown({
                onChange: function (value, text) { handlePullrequestsFilter(value); }
            });
        });
}

function handlePullrequestsFilter(value) {
    var order = $('#pullrequests_order_dropdown').dropdown('get value');
    if (order === '') {
        app.setLocation(`#/pullrequests/filter/${value}/page/1`);
    } else {
        var repository = repositoryStringToObject(value);
        handlePullrequestsOrder(order, repository);
    }
}

function printPullRequestItems(items) {
    $('#pullrequest_list').html('');
    items.map(function (item) {
        $('#pullrequest_list').append(pullrequestItem(item));
    });
}

function pullrequestItem(pullrequestData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<a>', {
                    text: pullrequestData.title,
                    class: 'header',
                    click: function () { getPullRequestPage(repositoryData.owner.login, repositoryData.name); }
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: `${pullrequestData.base.repo.owner.login}/${pullrequestData.base.repo.name}`
                    })
                }),
                $('<div>', {
                    class: 'extra',
                    html: [
                        $('<i>', {
                            class: 'hashtag icon'
                        }),
                        pullrequestData.number,
                        ' | ',
                        $('<i>', {
                            class: 'user icon'
                        }),
                        pullrequestData.user.login,
                        ' | ',
                        $('<i>', {
                            class: 'unhide icon'
                        }),
                        pullrequestData.reviews,
                        ' | ',
                        $('<i>', {
                            class: 'comments icon'
                        }),
                        pullrequestData.review_comments
                    ]
                })
            ]
        })
    });

    return item;
}