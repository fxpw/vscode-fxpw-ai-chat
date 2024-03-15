

function clickToOpenConversationButton(chatData){
	IN_CHAT = true;
	CURRENT_CHAT_ID = chatData.id;
	// console.log(chatData);
	createConversationBody(chatData);
}


// eslint-disable-next-line no-unused-vars
function createOpenConversationButton(chatData){
	let openConversationButton = document.createElement('button');
	openConversationButton.className = 'openConversationButton';
	// openConversationButton.textContent = chatData.name;

	let openConversationButtonTopText = document.createElement('span');
	// console.log(chatData.conversation,chatData.conversation.length,chatData.conversation.length>0)
	if (chatData.conversation.length>0){
		openConversationButtonTopText.textContent = chatData.conversation[chatData.conversation.length-1].content;
	}else{
		openConversationButtonTopText.textContent = "Empty chat";
	}
    openConversationButtonTopText.className = 'openConversationButtonTopText'; // Можете добавлять класс, если необходимо стилизовать
    openConversationButton.appendChild(openConversationButtonTopText);

    // Добавление перевода строки, если необходимо
    openConversationButton.appendChild(document.createElement('br')); 

    // Создание и добавление второй строки текста
    let openConversationButtonBottomText = document.createElement('span');
    openConversationButtonBottomText.textContent = chatData.model;
    openConversationButtonBottomText.className = 'openConversationButtonBottomText'; // Можете добавлять класс, если хотите применять уникальные стили
    openConversationButton.appendChild(openConversationButtonBottomText);

	openConversationButton.addEventListener('click', function() {
		clickToOpenConversationButton(chatData);
	});
	return openConversationButton;
}


function updateConversationsList(chatsListData) {
    let bodyElement = document.getElementById('body');

    bodyElement.innerHTML = '';

	let conversationsListContainer = document.createElement('div');
	conversationsListContainer.id = 'conversationsListContainer';
	conversationsListContainer.className = 'conversationsListContainer';

    chatsListData.forEach(function(chat) {
		let button = createOpenConversationButton(chat);
        conversationsListContainer.appendChild(button);
    });
	bodyElement.appendChild(conversationsListContainer);
}
