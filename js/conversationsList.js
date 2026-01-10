
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
		// Создаем контейнер для кнопки чата и кнопки удаления
		let chatContainer = document.createElement('div');
		chatContainer.className = 'chatContainer';

		// Создаем кнопку чата
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
			openConversationButtonTopText.textContent = window.localization.t('emptyChat');
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

		// Создаем кнопку удаления
		let deleteChatButton = document.createElement('button');
		deleteChatButton.className = 'deleteChatButton';
		deleteChatButton.title = 'Delete chat';

		let svgNS = "http://www.w3.org/2000/svg";
		let svgElement = document.createElementNS(svgNS, "svg");
		svgElement.setAttribute("width", "16");
		svgElement.setAttribute("height", "16");
		svgElement.setAttribute("viewBox", "0 0 24 24");
		svgElement.setAttribute("fill", "none");
		let pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", "M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20");
		pathElement.setAttribute("stroke", "currentColor");
		pathElement.setAttribute("stroke-width", "2");
		pathElement.setAttribute("stroke-linecap", "round");
		pathElement.setAttribute("stroke-linejoin", "round");
		svgElement.appendChild(pathElement);
		deleteChatButton.appendChild(svgElement);

		deleteChatButton.addEventListener('click', function (event) {
			event.stopPropagation(); // Предотвращаем клик по контейнеру
			vscode.postMessage({
				command: 'deleteChatButtonOnClickRequest',
				chatID: chatData.id,
			});
		});

		chatContainer.appendChild(openConversationButton);
		chatContainer.appendChild(deleteChatButton);

		return chatContainer;
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
