
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

		// Создаем контейнер для поиска
		let searchContainer = document.createElement('div');
		searchContainer.className = 'searchContainer';

		// Создаем поле поиска
		let searchInput = document.createElement('input');
		searchInput.type = 'text';
		searchInput.className = 'searchInput';
		searchInput.placeholder = window.localization.t('searchChats');
		searchInput.id = 'searchInput';

		// Создаем кнопку поиска
		let searchButton = document.createElement('button');
		searchButton.className = 'searchButton';
		searchButton.title = window.localization.t('search');
		searchButton.id = 'searchButton';

		let svgNS = "http://www.w3.org/2000/svg";
		let svgElement = document.createElementNS(svgNS, "svg");
		svgElement.setAttribute("width", "16");
		svgElement.setAttribute("height", "16");
		svgElement.setAttribute("viewBox", "0 0 24 24");
		svgElement.setAttribute("fill", "none");
		let pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", "M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z");
		pathElement.setAttribute("stroke", "currentColor");
		pathElement.setAttribute("stroke-width", "2");
		pathElement.setAttribute("stroke-linecap", "round");
		pathElement.setAttribute("stroke-linejoin", "round");
		svgElement.appendChild(pathElement);
		searchButton.appendChild(svgElement);

		// Обработчик клика по кнопке поиска
		searchButton.addEventListener('click', () => {
			performSearch(searchInput.value, chatsListData);
		});

		// Обработчик нажатия Enter в поле поиска
		searchInput.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				performSearch(searchInput.value, chatsListData);
			}
		});

		searchContainer.appendChild(searchInput);
		searchContainer.appendChild(searchButton);
		conversationsListContainer.appendChild(searchContainer);

		// Сохраняем оригинальный список чатов для поиска
		window.originalChatsList = chatsListData;

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
function performSearch(searchQuery, chatsListData) {
	try {
		if (!searchQuery.trim()) {
			// Если поисковый запрос пустой, показываем все чаты
			updateConversationsList(window.originalChatsList || chatsListData);
			return;
		}

		let filteredChats = chatsListData.filter(chat => {
			// Поиск в сообщениях чата
			let hasMatchInMessages = chat.conversation.some(message =>
				message.content.toLowerCase().includes(searchQuery.toLowerCase())
			);

			return hasMatchInMessages;
		});

		// Обновляем список чатов с отфильтрованными данными
		let conversationsListContainer = document.getElementById('conversationsListContainer');
		if (conversationsListContainer) {
			// Удаляем все чаты, кроме контейнера поиска
			let searchContainer = conversationsListContainer.querySelector('.searchContainer');
			conversationsListContainer.innerHTML = '';
			conversationsListContainer.appendChild(searchContainer);

			// Добавляем отфильтрованные чаты
			filteredChats.forEach(function (chat) {
				let button = createOpenConversationButton(chat);
				conversationsListContainer.appendChild(button);
			});
		}
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
