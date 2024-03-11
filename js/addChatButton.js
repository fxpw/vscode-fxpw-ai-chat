let addChatButton = document.getElementById('addChatButton');

function addChatButtonOnClick(){
	vscode.postMessage({
		command: 'addChatButtonOnClickRequest',
	});
}

function updateBodyAfterAddChatButtonOnClickResponse(chatsListData) {
    var bodyElement = document.getElementById('body');

    bodyElement.innerHTML = '';

    chatsListData.forEach(function(chat) {
        var button = createConversationButton(chat);
        bodyElement.appendChild(button);
    });
}


function addChatButtonOnClickResponse(message){
	let chatsListData = message.chatsListData.reverse();
	updateBodyAfterAddChatButtonOnClickResponse(chatsListData);
}


addChatButton.addEventListener('click', () => {
	addChatButtonOnClick();
});

