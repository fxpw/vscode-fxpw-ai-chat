

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

	let openConversationButtonTopText = document.createElement('span');
	if (chatData.conversation.length>0){
		openConversationButtonTopText.textContent = chatData.conversation[chatData.conversation.length-1].content;
	}else{
		openConversationButtonTopText.textContent = "Empty chat";
	}
    openConversationButtonTopText.className = 'openConversationButtonTopText';
    openConversationButton.appendChild(openConversationButtonTopText);

    openConversationButton.appendChild(document.createElement('br')); 

    let openConversationButtonBottomText = document.createElement('span');
    openConversationButtonBottomText.textContent = chatData.model;
    openConversationButtonBottomText.className = 'openConversationButtonBottomText';
    openConversationButton.appendChild(openConversationButtonBottomText);

	openConversationButton.addEventListener('click', function() {
		clickToOpenConversationButton(chatData);
	});
	// openConversationButton.addEventListener('mousemove', function(e) {
    //     const rect = e.target.getBoundingClientRect();
    //     const x = e.clientX - rect.left; // X координата относительно кнопки
    //     const y = e.clientY - rect.top; // Y координата относительно кнопки
    //     const centerX = rect.width / 2;
    //     const centerY = rect.height / 2;
    //     const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    //     const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2); // Максимальное расстояние от центра до угла
    //     const intensity = 1 - Math.min(distance / maxDistance, 1); // Интенсивность от 0 до 1
    //     openConversationButton.style.setProperty('--border-intensity', intensity.toFixed(2));
    // });
    
    // // Возвращаем нормальный стиль когда курсор уходит с кнопки
    // openConversationButton.addEventListener('mouseleave', function() {
    //     openConversationButton.style.setProperty('--border-intensity', 0);
    // });
	return openConversationButton;
}


// eslint-disable-next-line no-unused-vars
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
