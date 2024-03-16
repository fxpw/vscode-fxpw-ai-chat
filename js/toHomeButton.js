let toHomeButton = document.getElementById('toHomeButton');

function toHomeButtonOnClick() {
	vscode.postMessage({
		command: 'toHomeButtonOnClickRequest',
	});
	CURRENT_CHAT_ID=-1;
	IN_CHAT = false;
}

// eslint-disable-next-line no-unused-vars
function goToHome() {
	toHomeButtonOnClick();
	// console.log("js/toHomeButton.js");
}

// eslint-disable-next-line no-unused-vars
function toHomeButtonOnClickResponse(message) {
	let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
	updateConversationsList(sortedChatsDesc);
}

toHomeButton.addEventListener('click', () => {
	toHomeButtonOnClick();
});

