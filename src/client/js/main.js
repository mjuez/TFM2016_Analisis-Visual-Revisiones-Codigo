/**
 * main.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/** Task manager running status. */
var STATUS_RUNNING = 'status_running';

/** Task manager waiting status. */
var STATUS_WAITING = 'status_waiting';

/** Task manager error status. */
var STATUS_ERROR = 'status_error';

/**
 * When document ready we set the
 * footer padding and the task manager status
 * updating interval.
 * Then the app is redirected to the base route.
 */
$(document).ready(function () {

    setFooterPadding();
    setStatusInterval();

    app.run('#/');

});

/**
 * Sets footer padding.
 */
function setFooterPadding() {
    var padding = $('.ui.inverted.very.padded.basic.footer.segment').outerHeight();
    $('.full.height').css('padding-bottom', padding);
}

/**
 * Sets active menu item given the section name.
 * 
 * @param {string} activeSection    active section name.
 */
function setActiveMenuItem(activeSection) {

    $('#m_home').removeClass('active');
    $('#m_repositories').removeClass('active');
    $('#m_pullrequests').removeClass('active');
    $('#m_users').removeClass('active');
    if ($(`#m_${activeSection}`)) {
        $(`#m_${activeSection}`).addClass('active');
    }

}

/**
 * Shows a loader.
 */
function showLoader() {
    $('#content').hide();
    $('#loader').addClass('active');
}

/**
 * Hides the loader.
 */
function hideLoader() {
    $('#loader').removeClass('active');
    $('#content').show();
}

/**
 * Sets the task manager status 
 * retrieving API call 2 seconds.
 */
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

/**
 * Updates the status badge of the footer.
 * @param {string} status   current task manager status.
 */
function updateStatus(status) {
    hideStatus(STATUS_RUNNING);
    hideStatus(STATUS_WAITING);
    hideStatus(STATUS_ERROR);
    $(`#${status}`).removeClass('hidden');
}

/**
 * Hides a status badge
 * @param {string} status   a task manager status.
 */
function hideStatus(status) {
    if (!$(`#${status}`).hasClass('hidden')) {
        $(`#${status}`).addClass('hidden');
    }
}

/**
 * Prints a paginator.
 * 
 * @param {DOM element} paginator   a div which contains the paginator.
 * @param {number} currentPage      the current page.
 * @param {number} numPages         the number of total pages.
 * @param {string} url              base url.
 */
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

    /**
     * Appends a page link.
     * @param {number} page page number.
     */
    function appendPageLink(page) {
        var isActive = (page === parseInt(currentPage));
        var a = pageLink(page, isActive);
        paginator.append(a);
    }

    /**
     * Appends a disabled link.
     */
    function appendDisabledLink() {
        var disabled = $('<div>', {
            class: 'disabled item',
            html: '...'
        });
        paginator.append(disabled);
    }

    /**
     * Creates a page link.
     * 
     * @param {number} page         page number.
     * @param {boolean} isActive    if is active.
     */
    function pageLink(page, isActive) {
        var cssClass = "item";
        if (isActive) cssClass += " active";
        var a = $('<a>', {
            class: cssClass,
            text: page,
            href: `${url}/${page}`
        });
        return a;
    }
}

/**
 * Converts repository full name to a
 * pair owner, name JSON object.
 * @param {string} repository   repository full name.
 */
function repositoryStringToObject(repository){
    var repoArray = repository.split('/');
    return {
        owner: repoArray[0],
        name: repoArray[1]
    };
}