let addChatButton = document.getElementById('addChatButton');

function addChatButtonOnClick(){
	vscode.postMessage({
		command: 'addChatButtonOnClickRequest',
	});
}

// eslint-disable-next-line no-unused-vars
function addChatButtonOnClickResponse(message){
	let chatsListData = message.chatsListData.reverse();
	updateConversationsList(chatsListData);
}

addChatButton.addEventListener('click', () => {
	addChatButtonOnClick();
});

