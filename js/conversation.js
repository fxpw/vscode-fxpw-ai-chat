function clickToConversationButton(chat){
	console.log('Button clicked for chat:', chat.name,chat.id);
	CURRENT_CHAT_ID = chat.id;

	// Очищаем содержимое элемента body перед обновлением
    var bodyElement = document.getElementById('body');
    bodyElement.innerHTML = '';

    // Создаем элементы для беседы
    var conversationContainer = document.createElement('div');
    conversationContainer.id = 'conversationContainer';

    var chatHistory = document.createElement('div');
    chatHistory.id = 'chatHistory';
    chatHistory.textContent = 'Chat history goes here...';

    var inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.placeholder = 'Type your message...';

    var sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.addEventListener('click', function () {
        // Ваш код обработки отправки сообщения
        console.log('Message sent:', inputText.value);
    });

    // Добавляем созданные элементы в контейнер беседы
    conversationContainer.appendChild(chatHistory);
    conversationContainer.appendChild(inputText);
    conversationContainer.appendChild(sendButton);

    // Добавляем контейнер беседы в элемент body
    bodyElement.appendChild(conversationContainer);
}


function createConversationButton(chat){
	let button = document.createElement('button');
	button.className = 'chatButton';
	button.textContent = chat.name;
	button.addEventListener('click', function() {
		clickToConversationButton(chat);
	});
	return button;
}
