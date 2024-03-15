function updateBody(chatsListData) {
    let bodyElement = document.getElementById('body');

    bodyElement.innerHTML = '';

    chatsListData.forEach(function(chat) {
		let button = createOpenConversationButton(chat);
        bodyElement.appendChild(button);
    });
}
