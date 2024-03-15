let deleteChatButton = document.getElementById('deleteChatButton');

function deleteChatButtonOnClick(){
	if (CURRENT_CHAT_ID>=0){
		vscode.postMessage({
			command: 'deleteChatButtonOnClickRequest',
			chatID: CURRENT_CHAT_ID,
		});
	}
}

// eslint-disable-next-line no-unused-vars
function deleteChatButtonOnClickResponse(message){
	goToHome();
}


deleteChatButton.addEventListener('click', () => {
	deleteChatButtonOnClick();
});

