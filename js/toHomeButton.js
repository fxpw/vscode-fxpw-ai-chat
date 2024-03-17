

function toHomeButtonOnClick() {
	try {
		vscode.postMessage({
			command: 'toHomeButtonOnClickRequest',
		});
		CURRENT_CHAT_ID=-1;
		IN_CHAT = false;
		IS_CHAT_BLOCKED=false;
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function goToHome() {
	toHomeButtonOnClick();
}

// eslint-disable-next-line no-unused-vars
function toHomeButtonOnClickResponse(message) {
	try {
		let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		updateConversationsList(sortedChatsDesc);
	} catch (error) {
		console.error(error);
	}
}

try {
	let toHomeButton = document.getElementById('toHomeButton');
	toHomeButton.addEventListener('click', () => {
		toHomeButtonOnClick();
	});
} catch (error) {
	console.error(error);
}

