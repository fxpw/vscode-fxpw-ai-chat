let addChatButton = document.getElementById('addChatButton');

function addChatButtonOnClick(){
	vscode.postMessage({
		command: 'addChatButtonOnClickRequest',
	});
}


function addChatButtonOnClickResponse(message){
	let chatsListData = message.chatsListData.reverse();
	updateBody(chatsListData);
}


addChatButton.addEventListener('click', () => {
	addChatButtonOnClick();
});

