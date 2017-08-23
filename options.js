//NOT CURRENTLY BEING USED - may bring this back but it's a holdover from a previous CMS

// Saves options to chrome.storage.sync.
function save_options() {
	var fcontrol = document.getElementById('fcontrol').checked;
	var cbeat = document.getElementById('cbeat').checked;
	chrome.storage.sync.set({
		fcontrol_v: fcontrol,
		cbeat_v: cbeat,
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		fcontrol_v: true,
		cbeat_v: false
	}, function(items) {
		console.log(items);
		document.getElementById('fcontrol').checked = items.fcontrol_v;
		document.getElementById('cbeat').checked = items.favfix_v;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
