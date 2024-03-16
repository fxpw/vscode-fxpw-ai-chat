

function clickToOpenConversationButton(chatData) {
	IN_CHAT = true;
	CURRENT_CHAT_ID = chatData.id;
	// console.log(chatData);
	createConversationBody(chatData);
}

// eslint-disable-next-line no-unused-vars
function createOpenConversationButton(chatData) {
	let openConversationButton = document.createElement('button');
	if (chatData.conversation.length == 0 || chatData.conversation[chatData.conversation.length-1].role == "user") {
		openConversationButton.className = "openConversationButton userMargin";
	} else {
		openConversationButton.className = "openConversationButton nonuserMargin";
	}
	let openConversationButtonTopText = document.createElement('span');
	if (chatData.conversation.length > 0) {
		openConversationButtonTopText.textContent = chatData.conversation[chatData.conversation.length - 1].content;
	} else {
		openConversationButtonTopText.textContent = "Empty chat";
	}
	openConversationButtonTopText.className = 'openConversationButtonTopText';
	openConversationButton.appendChild(openConversationButtonTopText);

	openConversationButton.appendChild(document.createElement('br'));

	let openConversationButtonBottomText = document.createElement('span');
	openConversationButtonBottomText.textContent = chatData.model;
	openConversationButtonBottomText.className = 'openConversationButtonBottomText';
	openConversationButton.appendChild(openConversationButtonBottomText);

	openConversationButton.addEventListener('click', function () {
		clickToOpenConversationButton(chatData);
	});
	return openConversationButton;
}


// eslint-disable-next-line no-unused-vars
function updateConversationsList(chatsListData) {
	let bodyElement = document.getElementById('body');

	bodyElement.innerHTML = '';

	let conversationsListContainer = document.createElement('div');
	conversationsListContainer.id = 'conversationsListContainer';
	conversationsListContainer.className = 'conversationsListContainer';

	chatsListData.forEach(function (chat) {
		let button = createOpenConversationButton(chat);
		conversationsListContainer.appendChild(button);
	});

	bodyElement.appendChild(conversationsListContainer);
}
