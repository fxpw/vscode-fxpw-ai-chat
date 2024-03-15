let toHomeButton = document.getElementById('toHomeButton');

function toHomeButtonOnClick() {
	vscode.postMessage({
		command: 'toHomeButtonOnClickRequest',
	});
}

function goToHome() {
	toHomeButtonOnClick();
	console.log("js/toHomeButton.js");
}



function toHomeButtonOnClickResponse(message) {
	let chatsListData = message.chatsListData.reverse();
	updateBody(chatsListData);
}

toHomeButton.addEventListener('click', () => {
	toHomeButtonOnClick();
});

