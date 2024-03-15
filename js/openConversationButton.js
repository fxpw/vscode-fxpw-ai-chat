

function clickToOpenConversationButton(chatData){
	IN_CHAT = true;
	CURRENT_CHAT_ID = chatData.id;
	createConversationBody(chatData);
}


function createOpenConversationButton(chatData){
	let button = document.createElement('button');
	button.className = 'openConversationButton';
	button.textContent = chatData.name;
	button.addEventListener('click', function() {
		clickToOpenConversationButton(chatData);
	});
	return button;
}
