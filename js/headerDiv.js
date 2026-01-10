


function toHomeButtonOnClick() {
	try {
		vscode.postMessage({
			command: 'toHomeButtonOnClickRequest',
		});
		CURRENT_CHAT_ID=-1;
		IN_CHAT = false;
		IS_CHAT_BLOCKED=false;
		IN_MODELS_MANAGER = false;
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function goToHome() {
	toHomeButtonOnClick();
}

// eslint-disable-next-line no-unused-vars
function toHomeButtonOnClickResponse(message) {
	try {
		let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		updateConversationsList(sortedChatsDesc);
		// Update models data if provided
		if (message.modelsData) {
			window.modelsData = message.modelsData;
		}
	} catch (error) {
		console.error(error);
	}
}


function addChatButtonOnClick(){
	try {
		showModelSelectionDialog();
	} catch (error) {
		console.error(error);
	}
}

function showModelSelectionDialog() {
	try {
		if (!window.modelsData || window.modelsData.length === 0) {
			alert('Нет доступных моделей. Сначала создайте модель в менеджере моделей.');
			openModelsManager();
			return;
		}

		let dialog = document.createElement('div');
		dialog.className = 'modelDialog';

		let overlay = document.createElement('div');
		overlay.className = 'dialogOverlay';
		overlay.addEventListener('click', () => {
			document.body.removeChild(dialog);
		});

		let dialogContent = document.createElement('div');
		dialogContent.className = 'dialogContent modelSelectionDialog';

		let title = document.createElement('h3');
		title.textContent = 'Выберите модель для нового чата';
		dialogContent.appendChild(title);

		let modelsList = document.createElement('div');
		modelsList.className = 'modelSelectionList';

		window.modelsData.forEach(model => {
			let modelOption = document.createElement('div');
			modelOption.className = 'modelOption';
			modelOption.addEventListener('click', () => {
				createChatWithModel(model.id);
				document.body.removeChild(dialog);
			});

			let modelName = document.createElement('div');
			modelName.className = 'modelName';
			modelName.textContent = model.name;
			modelOption.appendChild(modelName);

			let modelDetails = document.createElement('div');
			modelDetails.className = 'modelDetails';
			let detailsText = `Модель: ${model.modelName}`;
			if (model.baseUrl) {
				detailsText += ` | URL: ${model.baseUrl}`;
			}
			modelDetails.textContent = detailsText;
			modelOption.appendChild(modelDetails);

			let modelProxy = document.createElement('div');
			modelProxy.className = 'modelProxy';
			modelProxy.textContent = model.useProxy ? `Прокси: ${model.proxyIP}:${model.proxyPortHttps}` : 'Без прокси';
			modelOption.appendChild(modelProxy);

			modelsList.appendChild(modelOption);
		});

		dialogContent.appendChild(modelsList);

		let cancelButton = document.createElement('button');
		cancelButton.className = 'cancelButton';
		cancelButton.textContent = 'Отмена';
		cancelButton.addEventListener('click', () => {
			document.body.removeChild(dialog);
		});
		dialogContent.appendChild(cancelButton);

		dialog.appendChild(dialogContent);
		document.body.appendChild(dialog);
	} catch (error) {
		console.error(error);
	}
}

function createChatWithModel(modelId) {
	try {
		vscode.postMessage({
			command: 'createChatWithModelRequest',
			modelId: modelId
		});
	} catch (error) {
		console.error(error);
	}
}

// eslint-disable-next-line no-unused-vars
function addChatButtonOnClickResponse(message){
	try {
		// let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		// updateConversationsList(sortedChatsDesc);
		clickToOpenConversationButton(message.newChatID);
	} catch (error) {
		console.error(error);
	}
}


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


// eslint-disable-next-line no-unused-vars
function updateHeader(){
	try {
		let headerDiv = document.getElementById('header');
		headerDiv.innerHTML=""
		let svgNS = "http://www.w3.org/2000/svg";
		
		if (IN_CHAT){
			let toHomeButton = document.createElement('button');
			toHomeButton.id = 'toHomeButton';
			toHomeButton.className = 'headerButton';
			let svgElementHome = document.createElementNS(svgNS, "svg");
			svgElementHome.setAttribute("width", "24");
			svgElementHome.setAttribute("height", "24");
			svgElementHome.setAttribute("viewBox", "0 0 24 24");
			svgElementHome.setAttribute("fill", "none");
			let pathElementHome = document.createElementNS(svgNS, "path");
			pathElementHome.setAttribute("d", "M3 9.5V21H21V9.5L12 2L3 9.5ZM11 12V18H13V12H11Z");
			pathElementHome.setAttribute("fill", "currentColor");
			svgElementHome.appendChild(pathElementHome);
			toHomeButton.appendChild(svgElementHome);

			toHomeButton.addEventListener('click', () => {
				toHomeButtonOnClick();
			});

			let spacer = document.createElement('div');
			spacer.className = 'spacer';

			let deleteChatButton = document.createElement('button');
			deleteChatButton.id = 'deleteChatButton';
			deleteChatButton.className = 'headerButton';
			let svgElementMinus = document.createElementNS(svgNS, "svg");
			svgElementMinus.setAttribute("width", "24");
			svgElementMinus.setAttribute("height", "24");
			svgElementMinus.setAttribute("viewBox", "0 0 24 24");
			svgElementMinus.setAttribute("fill", "none");
			let pathElementMinus = document.createElementNS(svgNS, "path");
			pathElementMinus.setAttribute("d", "M5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44771 13 4 12.5523 4 12C4 11.4477 4.44771 11 5 11Z");
			pathElementMinus.setAttribute("fill", "currentColor");
			svgElementMinus.appendChild(pathElementMinus);
			deleteChatButton.appendChild(svgElementMinus);
			deleteChatButton.addEventListener('click', () => {
				deleteChatButtonOnClick();
			});

			headerDiv.appendChild(toHomeButton);
			headerDiv.appendChild(spacer);
			headerDiv.appendChild(deleteChatButton);

		}else if (IN_MODELS_MANAGER){
			let toHomeButton = document.createElement('button');
			toHomeButton.id = 'toHomeButton';
			toHomeButton.className = 'headerButton';
			let svgElementHome = document.createElementNS(svgNS, "svg");
			svgElementHome.setAttribute("width", "24");
			svgElementHome.setAttribute("height", "24");
			svgElementHome.setAttribute("viewBox", "0 0 24 24");
			svgElementHome.setAttribute("fill", "none");
			let pathElementHome = document.createElementNS(svgNS, "path");
			pathElementHome.setAttribute("d", "M3 9.5V21H21V9.5L12 2L3 9.5ZM11 12V18H13V12H11Z");
			pathElementHome.setAttribute("fill", "currentColor");
			svgElementHome.appendChild(pathElementHome);
			toHomeButton.appendChild(svgElementHome);

			toHomeButton.addEventListener('click', () => {
				toHomeButtonOnClick();
			});

			headerDiv.appendChild(toHomeButton);

		}else{

			// let testChatButton = document.createElement('button');
			// testChatButton.id = 'testChatButton';
			// testChatButton.className = 'headerButton';
			// testChatButton.addEventListener('click', () => {
			// 	// test();
			// });
			// let svgElementTest = document.createElementNS(svgNS, "svg");
			// svgElementTest.setAttribute("width", "24");
			// svgElementTest.setAttribute("height", "24");
			// svgElementTest.setAttribute("viewBox", "0 0 24 24");
			// svgElementTest.setAttribute("fill", "none");
			// let pathElementTest = document.createElementNS(svgNS, "path");
			// pathElementTest.setAttribute("d", "M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44771 11 4 11.4477 4 12C4 12.5523 4.44771 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z");
			// pathElementTest.setAttribute("fill", "currentColor");
			// pathElementTest.appendChild(svgElementTest);
			// testChatButton.appendChild(pathElementTest);

			let spacer1 = document.createElement('div');
			spacer1.className = 'spacer';

			let modelsButton = document.createElement('button');
			modelsButton.id = 'modelsButton';
			modelsButton.className = 'headerButton';
			modelsButton.title = 'Управление моделями';
			let svgElementModels = document.createElementNS(svgNS, "svg");
			svgElementModels.setAttribute("width", "24");
			svgElementModels.setAttribute("height", "24");
			svgElementModels.setAttribute("viewBox", "0 0 24 24");
			svgElementModels.setAttribute("fill", "none");
			let pathElementModels = document.createElementNS(svgNS, "path");
			pathElementModels.setAttribute("d", "M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17V12L12 17L2 12V17Z");
			pathElementModels.setAttribute("fill", "currentColor");
			svgElementModels.appendChild(pathElementModels);
			modelsButton.appendChild(svgElementModels);
			modelsButton.addEventListener('click', () => {
				openModelsManager();
			});

			let spacer2 = document.createElement('div');
			spacer2.className = 'spacer';

			let addChatButton = document.createElement('button');
			addChatButton.id = 'addChatButton';
			addChatButton.className = 'headerButton';
			addChatButton.addEventListener('click', () => {
				addChatButtonOnClick();
			});
			let svgElementPlus = document.createElementNS(svgNS, "svg");
			svgElementPlus.setAttribute("width", "24");
			svgElementPlus.setAttribute("height", "24");
			svgElementPlus.setAttribute("viewBox", "0 0 24 24");
			svgElementPlus.setAttribute("fill", "none");
			let pathElementPlus = document.createElementNS(svgNS, "path");
			pathElementPlus.setAttribute("d", "M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44771 11 4 11.4477 4 12C4 12.5523 4.44771 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z");
			pathElementPlus.setAttribute("fill", "currentColor");
			svgElementPlus.appendChild(pathElementPlus);
			addChatButton.appendChild(svgElementPlus);


			// headerDiv.appendChild(testChatButton);
			headerDiv.appendChild(modelsButton);
			headerDiv.appendChild(spacer1);
			headerDiv.appendChild(spacer2);
			headerDiv.appendChild(addChatButton);
		}

	} catch (error) {
		console.error(error);
	}
}