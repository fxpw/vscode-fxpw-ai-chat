let addChatButton = document.getElementById('addChatButton');

function addChatButtonOnClick(){
	vscode.postMessage({
		command: 'addChatButtonOnClickRequest',
	});
}

// eslint-disable-next-line no-unused-vars
function addChatButtonOnClickResponse(message){
	let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
	updateConversationsList(sortedChatsDesc);
}

addChatButton.addEventListener('click', () => {
	addChatButtonOnClick();
});

