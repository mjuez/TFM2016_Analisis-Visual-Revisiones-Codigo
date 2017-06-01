var STATUS_RUNNING = 'status_running';
var STATUS_WAITING = 'status_waiting';
var STATUS_ERROR = 'status_error';

$(document).ready(function () {

    setFooterHeight();
    setStatusInterval();

    app.run('#/');

});

function setFooterHeight() {
    var padding = $('.ui.inverted.very.padded.basic.footer.segment').outerHeight();
    $('.full.height').css('padding-bottom', padding);
}

function setActiveMenuItem(activeSection) {

    $('#m_home').removeClass('active');
    $('#m_repositories').removeClass('active');
    $('#m_pullrequests').removeClass('active');
    $('#m_users').removeClass('active');
    if ($(`#m_${activeSection}`)) {
        $(`#m_${activeSection}`).addClass('active');
    }

}

function showLoader() {
    $('#content').hide();
    $('#loader').addClass('active');
}

function hideLoader() {
    $('#loader').removeClass('active');
    $('#content').show();
}

function setStatusInterval() {
    setInterval(function () {
        $.get(`/api/taskmanager/status`).done(function (result) {
            if (result.status.error === undefined) {
                if (result.status === 'running') {
                    updateStatus(STATUS_RUNNING);
                } else {
                    updateStatus(STATUS_WAITING);
                }
            } else {
                updateStatus(STATUS_ERROR);
            }
        });
    }, 2000);
}

function updateStatus(status) {
    hideStatus(STATUS_RUNNING);
    hideStatus(STATUS_WAITING);
    hideStatus(STATUS_ERROR);
    $(`#${status}`).removeClass('hidden');
}

function hideStatus(status) {
    if (!$(`#${status}`).hasClass('hidden')) {
        $(`#${status}`).addClass('hidden');
    }
}

function printPaginator(paginator, currentPage, numPages, url) {
    paginator.html('');

    if (numPages < 12) {
        for (var page = 1; page <= numPages; page++) {
            appendPageLink(page);
        }
    } else {
        if (currentPage < 7) {
            for (var page = 1; page < 10; page++) {
                appendPageLink(page);
            }
            appendDisabledLink();
            appendPageLink(numPages);
        } else {
            appendPageLink(1);
            appendDisabledLink();
            var numLastPages = numPages - currentPage;
            if (numLastPages <= 5) {
                var numPrevVisible = 8 - numLastPages;
                for (var page = currentPage - numPrevVisible; page <= numPages; page++) {
                    appendPageLink(page);
                }
            } else {
                for (var page = currentPage - 3; page <= currentPage + 3; page++) {
                    appendPageLink(page);
                }
                appendDisabledLink();
                appendPageLink(numPages);
            }

        }
    }

    function appendPageLink(page) {
        var isActive = (page === currentPage);
        var a = pageLink(page, isActive);
        paginator.append(a);
    }

    function appendDisabledLink() {
        var disabled = $('<div>', {
            class: 'disabled item',
            html: '...'
        });
        paginator.append(disabled);
    }

    function pageLink(page, isActive) {
        var cssClass = "item";
        if (isActive) cssClass += " active";
        var a = $('<a>', {
            class: cssClass,
            text: page,
            herf: `${url}/${page}`
        });
        return a;
    }
}