$(document).ready(function () {

    $.fn.api.settings.api = {
        'request repository': '/api/remote/{owner}/{repository}/pulls/'
    }

    const activeSection = $(location).prop('pathname').split('/')[1];

    const menuItems = {
        home: $('#m_home'),
        repositories: $('#m_repositories'),
        pullrequests: $('#m_pullrequests'),
        users: $('#m_users')
    }

    setActiveMenuItem(menuItems, activeSection);
    setMenuClickEvents(menuItems)

    let requestRepositoryBtn = $('.request-repository');
    requestRepositoryBtn.api({
        action: 'request repository',
        beforeSend: function (settings) {
            settings.urlData = {
                owner: $('#owner').val(),
                repository: $('#repository').val()
            };
            return settings;
        }
    });

});

function setActiveMenuItem(menuItems, activeSection) {

    menuItems['home'].removeClass('active');
    menuItems['repositories'].removeClass('active');
    menuItems['pullrequests'].removeClass('active');
    menuItems['users'].removeClass('active');

    let active = 'home';
    if (activeSection.length > 0) {
        active = activeSection;
    }

    menuItems[active].addClass('active');

}

function setMenuClickEvents(menuItems) {

    menuItems.home.on('click', () => {
        history.pushState(null, 'Inicio', '/');
        setActiveMenuItem(menuItems, 'home');
    });

    menuItems.repositories.on('click', () => {
        history.pushState(null, 'Repositorios', 'repositories');
        setActiveMenuItem(menuItems, 'repositories');
    });

    menuItems.pullrequests.on('click', () => {
        history.pushState(null, 'Pull Requests', 'pullrequests');
        setActiveMenuItem(menuItems, 'pullrequests');
    });

    menuItems.users.on('click', () => {
        history.pushState(null, 'Usuarios', 'users');
        setActiveMenuItem(menuItems, 'users');
    });
    
}