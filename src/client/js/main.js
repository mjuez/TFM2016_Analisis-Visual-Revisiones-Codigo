const SECTION_HOME = 'home';
const SECTION_REPOSITORIES = 'repositories';
const SECTION_PULLREQUESTS = 'pullrequests';
const SECTION_USERS = 'users';
const STATUS_RUNNING = 'status_running';
const STATUS_WAITING = 'status_waiting';
const STATUS_ERROR = 'status_error';

$(document).ready(function () {

    const _section = $(location).prop('pathname').split('/')[1];
    let activeSection = 'home';
    if (_section.length > 0) {
        activeSection = _section;
    }


    const menuItems = {
        home: $('#m_home'),
        repositories: $('#m_repositories'),
        pullrequests: $('#m_pullrequests'),
        users: $('#m_users')
    }

    setFooterHeight();
    setActiveMenuItem(menuItems, activeSection);
    setMenuClickEvents(menuItems);
    loadSection(activeSection);
    setStatusInterval();

});

function setFooterHeight() {
    var padding = $('.ui.inverted.very.padded.basic.footer.segment').outerHeight();
    $('.full.height').css('padding-bottom', padding);
}

function setActiveMenuItem(menuItems, activeSection) {

    menuItems[SECTION_HOME].removeClass('active');
    menuItems[SECTION_REPOSITORIES].removeClass('active');
    menuItems[SECTION_PULLREQUESTS].removeClass('active');
    menuItems[SECTION_USERS].removeClass('active');
    if (menuItems[activeSection]) {
        menuItems[activeSection].addClass('active');
    }

}

function setMenuClickEvents(menuItems) {

    menuItems.home.on('click', () => {
        history.pushState(null, 'Inicio', '/');
        setActiveMenuItem(menuItems, SECTION_HOME);
        loadSection(SECTION_HOME);
    });

    menuItems.repositories.on('click', () => {
        history.pushState(null, 'Repositorios', '/repositories');
        setActiveMenuItem(menuItems, SECTION_REPOSITORIES);
        loadSection(SECTION_REPOSITORIES);
    });

    menuItems.pullrequests.on('click', () => {
        history.pushState(null, 'Pull Requests', '/pullrequests');
        setActiveMenuItem(menuItems, SECTION_PULLREQUESTS);
        loadSection(SECTION_PULLREQUESTS);
    });

    menuItems.users.on('click', () => {
        history.pushState(null, 'Usuarios', '/users');
        setActiveMenuItem(menuItems, SECTION_USERS);
        loadSection(SECTION_USERS);
    });

}

function loadSection(section) {
    showLoader();
    switch (section) {
        case SECTION_HOME:
            loadHome(hideLoader);
            break;
        case SECTION_REPOSITORIES:
            loadRepositories(hideLoader);
            break;
        case SECTION_PULLREQUESTS:
            loadPullrequests(hideLoader);
            break;
        case SECTION_USERS:
            loadUsers(hideLoader);
            break;
        default:
            showError(hideLoader);
    }
}

function showLoader() {
    $('#loader').addClass('active');
}

function hideLoader() {
    $('#loader').removeClass('active');
}

function setStatusInterval() {
    setInterval(function () {
        $.get(`/api/taskmanager/status`).done(function (result) {
            console.log(result);
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