
function addChatButtonOnClick(){
	try {
		vscode.postMessage({
			command: 'addChatButtonOnClickRequest',
		});
	} catch (error) {
		console.error(error);
	}
}

// eslint-disable-next-line no-unused-vars
function addChatButtonOnClickResponse(message){
	try {
		let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		updateConversationsList(sortedChatsDesc);
	} catch (error) {
		console.error(error);
	}
}

try {
	let addChatButton = document.getElementById('addChatButton');
	addChatButton.addEventListener('click', () => {
		addChatButtonOnClick();
	});
} catch (error) {
	console.error(error);
}