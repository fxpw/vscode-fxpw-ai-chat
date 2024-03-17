

function deleteChatButtonOnClick(){
	try {
		if (CURRENT_CHAT_ID>=0 &&!IS_CHAT_BLOCKED){
			vscode.postMessage({
				command: 'deleteChatButtonOnClickRequest',
				chatID: CURRENT_CHAT_ID,
			});
		}
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function deleteChatButtonOnClickResponse(message){
	goToHome();
}


try {
	let deleteChatButton = document.getElementById('deleteChatButton');
	deleteChatButton.addEventListener('click', () => {
		deleteChatButtonOnClick();
	});
} catch (error) {
	console.error(error);
}



