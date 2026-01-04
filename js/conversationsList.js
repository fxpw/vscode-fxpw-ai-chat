
function clickToOpenConversationButton(chatID) {
	try {
		IN_CHAT = true;
		CURRENT_CHAT_ID=chatID;
		vscode.postMessage({
			command: 'clickToOpenConversationButtonRequest',
			chatID : chatID,
		});
	} catch (error) {
		console.error(error);
	}
}

// eslint-disable-next-line no-unused-vars
function createOpenConversationButton(chatData) {
	try {
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
		// Get model name by modelId
		let modelName = "Unknown Model";
		if (window.modelsData) {
			const model = window.modelsData.find(m => m.id === chatData.modelId);
			if (model) {
				modelName = model.name;
			}
		}
		openConversationButtonBottomText.textContent = modelName;
		openConversationButtonBottomText.className = 'openConversationButtonBottomText';
		openConversationButton.appendChild(openConversationButtonBottomText);
	
		openConversationButton.addEventListener('click', function () {
			clickToOpenConversationButton(chatData.id);
		});
		return openConversationButton;
	} catch (error) {
		console.error(error);
	}

}


// eslint-disable-next-line no-unused-vars
function updateConversationsList(chatsListData) {
	try {
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
	} catch (error) {
		console.error(error);
	}

}


// eslint-disable-next-line no-unused-vars
function loadViewOnLoadRequest(){
	try {
		vscode.postMessage({
			command: 'loadViewOnLoadRequest',
		});
	} catch (error) {
		console.error(error);
	}

}
