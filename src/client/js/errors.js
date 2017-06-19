/**
 * errors.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/**
 * Shows the error page.
 * 
 * @param {function} callback   callback function.
 */
function showError(callback) {
    $('#content').load(`/_error.html`, callback);
}