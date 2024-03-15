let addChatButton = document.getElementById('addChatButton');

function addChatButtonOnClick(){
	vscode.postMessage({
		command: 'addChatButtonOnClickRequest',
	});
}


function addChatButtonOnClickResponse(message){
	let chatsListData = message.chatsListData.reverse();
	updateConversationsList(chatsListData);
}


addChatButton.addEventListener('click', () => {
	addChatButtonOnClick();
});

