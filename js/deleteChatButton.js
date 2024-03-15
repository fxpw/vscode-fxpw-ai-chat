let deleteChatButton = document.getElementById('deleteChatButton');

function deleteChatButtonOnClick(){
	// console.log(CURRENT_CHAT_ID>=0);
	// console.log(CURRENT_CHAT_ID);
	if (CURRENT_CHAT_ID>=0){
		vscode.postMessage({
			command: 'deleteChatButtonOnClickRequest',
			chatID: CURRENT_CHAT_ID,
		});
	}
}


// eslint-disable-next-line no-unused-vars
function deleteChatButtonOnClickResponse(message){
	// let chatsListData = message.chatsListData.reverse();
	goToHome();
}


deleteChatButton.addEventListener('click', () => {
	deleteChatButtonOnClick();
});

