function loadRepositories(callback) {
    $('#content').load(`/_repositories.html`, () => {
        const url = $(location).prop('pathname').split('/');
        if(url.length > 2){
            const isPage = url[2] === 'page';
            if(isPage){
                const page = Number.parseInt(url[3]);
                getRepositoryPage(page);
            }else{
                // GET SINGLE REPOSITORY
            }
        }else{
            getRepositoryPage(1);
        }    
    });
}

function getRepositoryPage(page) {
    $('#loader').addClass('active');
    $.get(`/api/repos/page/${page}`)
        .done((result) => {
            printRepositoryItems(result.data);
            let paginator = $('#repository_paginator');
            printRepositoryPaginator(paginator, page, result.last_page);
            history.pushState(null, `Repositorios - Página ${page}`, `/repositories/page/${page}`);
            $('#loader').removeClass('active');
        })
        .fail((error) => {
            $('#repository_list').html('No se pueden obtener los repositorios en este momento.');
            $('#loader').removeClass('active');
        });
}

function printRepositoryItems(items) {
    $('#repository_list').html('');
    items.map((item) => {
        $('#repository_list').append(repositoryItem(item));
    });
}

function repositoryItem(repositoryData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<div>', {
                    class: 'header',
                    html: repositoryData.name
                }),
                $('<div>', {
                    class: 'meta',
                    html: $('<span>', {
                        class: 'full name',
                        html: [
                            $('<i>', {
                                class: 'github icon'
                            }),
                            $('<a>', {
                                href: repositoryData.html_url,
                                target: '_BLANK',
                                html: repositoryData.full_name
                            })
                        ]
                    })
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: repositoryData.description
                    })
                })
            ]
        })
    });

    return item;
}

function printRepositoryPaginator(paginator, currentPage, numPages) {
    paginator.html('');

    if (numPages < 12) {
        for (let page = 1; page <= numPages; page++) {
            appendPageLink(page);
        }
    } else {
        if (currentPage < 7) {
            for (let page = 1; page < 10; page++) {
                appendPageLink(page);
            }
            appendDisabledLink();
            appendPageLink(numPages);
        } else {
            appendPageLink(1);
            appendDisabledLink();
            let numLastPages = numPages - currentPage;
            if (numLastPages <= 5) {
                let numPrevVisible = 8 - numLastPages;
                for (let page = currentPage - numPrevVisible; page <= numPages; page++) {
                    appendPageLink(page);
                }
            } else {
                for (let page = currentPage - 3; page <= currentPage + 3; page++) {
                    appendPageLink(page);
                }
                appendDisabledLink();
                appendPageLink(numPages);
            }

        }
    }

    function appendPageLink(page) {
        const isActive = page === currentPage;
        const a = pageLink(page, isActive);
        paginator.append(a);
    }

    function appendDisabledLink() {
        const disabled = $('<div>', {
            class: 'disabled item',
            html: '...'
        });
        paginator.append(disabled);
    }

    function pageLink(page, isActive) {
        let cssClass = "item";
        if (isActive) cssClass += " active";
        const a = $('<a/>', {
            class: cssClass,
            text: page,
            click: () => { getRepositoryPage(page); }
        });
        return a;
    }
}