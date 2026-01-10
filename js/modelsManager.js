// Model management functionality

function openModelsManager() {
	try {
		IN_MODELS_MANAGER = true;
		showModelsManagerDialog();
		updateHeader();
	} catch (error) {
		console.error(error);
	}
}

function showModelsManagerDialog() {
	try {
		let bodyElement = document.getElementById('body');
		bodyElement.innerHTML = '';

		let modelsManagerContainer = document.createElement('div');
		modelsManagerContainer.id = 'modelsManagerContainer';
		modelsManagerContainer.className = 'modelsManagerContainer';

		// Header
		let header = document.createElement('div');
		header.className = 'modelsManagerHeader';

		let title = document.createElement('h2');
		title.textContent = 'Управление моделями';
		// header.appendChild(title);

		let closeButton = document.createElement('button');
		closeButton.className = 'closeButton';
		closeButton.textContent = '×';
		closeButton.addEventListener('click', () => {
			IN_MODELS_MANAGER = false;
			loadViewOnLoadRequest();
			updateHeader();
		});
		// header.appendChild(closeButton);

		modelsManagerContainer.appendChild(header);

		// Models list
		let modelsList = document.createElement('div');
		modelsList.id = 'modelsList';
		modelsList.className = 'modelsList';

		modelsManagerContainer.appendChild(modelsList);

		// Add model button
		let addModelButton = document.createElement('button');
		addModelButton.className = 'addModelButton';
		addModelButton.textContent = '+ Добавить модель';
		addModelButton.addEventListener('click', () => {
			showAddModelDialog();
		});
		modelsManagerContainer.appendChild(addModelButton);

		bodyElement.appendChild(modelsManagerContainer);

		loadModelsList();
	} catch (error) {
		console.error(error);
	}
}

function loadModelsList() {
	try {
		vscode.postMessage({
			command: 'getModelsListRequest'
		});
	} catch (error) {
		console.error(error);
	}
}

function updateModelsList(models) {
	try {
		window.modelsData = models; // Store globally for other functions

		let modelsList = document.getElementById('modelsList');
		modelsList.innerHTML = '';

		if (models.length === 0) {
			let emptyMessage = document.createElement('p');
			emptyMessage.textContent = 'Нет созданных моделей. Добавьте первую модель.';
			emptyMessage.className = 'emptyMessage';
			modelsList.appendChild(emptyMessage);
			return;
		}

		models.forEach(model => {
			let modelItem = document.createElement('div');
			modelItem.className = 'modelItem';

			let modelInfo = document.createElement('div');
			modelInfo.className = 'modelInfo';

			let modelName = document.createElement('div');
			modelName.className = 'modelName';
			modelName.textContent = model.name;
			modelInfo.appendChild(modelName);

			let modelDetails = document.createElement('div');
			modelDetails.className = 'modelDetails';
			let detailsText = `Модель: ${model.modelName}`;
			if (model.baseUrl) {
				detailsText += ` | URL: ${model.baseUrl}`;
			}
			modelDetails.textContent = detailsText;
			modelInfo.appendChild(modelDetails);

			modelItem.appendChild(modelInfo);

			let modelActions = document.createElement('div');
			modelActions.className = 'modelActions';

			let editButton = document.createElement('button');
			editButton.className = 'editButton';
			editButton.textContent = 'Edit';
			editButton.addEventListener('click', () => {
				showEditModelDialog(model);
			});
			modelActions.appendChild(editButton);

			let deleteButton = document.createElement('button');
			deleteButton.className = 'deleteButton';
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', () => {
				// if (confirm(`Удалить модель "${model.name}"?`)) {
					deleteModel(model.id);
				// }
			});
			modelActions.appendChild(deleteButton);

			modelItem.appendChild(modelActions);
			modelsList.appendChild(modelItem);
		});
	} catch (error) {
		console.error(error);
	}
}

function showAddModelDialog() {
	showModelDialog(null);
}

function showEditModelDialog(model) {
	showModelDialog(model);
}

function showModelDialog(model) {
	try {
		let dialog = document.createElement('div');
		dialog.className = 'modelDialog';

		let overlay = document.createElement('div');
		overlay.className = 'dialogOverlay';
		overlay.addEventListener('click', () => {
			document.body.removeChild(dialog);
		});

		let dialogContent = document.createElement('div');
		dialogContent.className = 'dialogContent';

		let title = document.createElement('h3');
		title.textContent = model ? 'Edit model' : 'Add model';
		dialogContent.appendChild(title);

		let form = document.createElement('form');
		form.className = 'modelForm';

		// Display Name field
		let nameGroup = createFormGroupWithHelp('name', 'Name', 'text', model?.name || '', 'Человекочитаемое название модели для показа в списке чатов');
		form.appendChild(nameGroup);

		// API Key field
		let apiKeyGroup = createFormGroupWithHelp('apiKey', 'API Key', 'password', model?.apiKey || '', 'Ключ для доступа к API провайдера');
		form.appendChild(apiKeyGroup);

		// Base URL field
		let baseUrlGroup = createFormGroupWithHelp('baseUrl', 'Base URL', 'text', model?.baseUrl || '', 'Адрес API сервера (оставьте пустым для автоопределения)');
		form.appendChild(baseUrlGroup);

		// Model Name field
		let modelNameGroup = createFormGroupWithHelp('modelName', 'Name for request', 'text', model?.modelName || 'gpt-4o-mini', 'Название модели в API (gpt-4o-mini, deepseek-chat, llama3.1:8b и т.д.)');
		form.appendChild(modelNameGroup);

		// Proxy settings
		let proxySection = document.createElement('div');
		proxySection.className = 'formSection';

		let proxyTitle = document.createElement('h4');
		proxyTitle.textContent = 'Настройки прокси';
		proxySection.appendChild(proxyTitle);

		let useProxyGroup = createFormGroup('useProxy', 'Использовать прокси', 'checkbox', model?.useProxy || false);
		proxySection.appendChild(useProxyGroup);

		let useSOCKS5Group = createFormGroup('useSOCKS5', 'SOCKS5 прокси', 'checkbox', model?.useSOCKS5 || false);
		proxySection.appendChild(useSOCKS5Group);

		let proxyIPGroup = createFormGroup('proxyIP', 'IP адрес прокси', 'text', model?.proxyIP || '');
		proxySection.appendChild(proxyIPGroup);

		let proxyPortGroup = createFormGroup('proxyPortHttps', 'Порт прокси', 'number', model?.proxyPortHttps || 0);
		proxySection.appendChild(proxyPortGroup);

		let proxyLoginGroup = createFormGroup('proxyLogin', 'Логин прокси', 'text', model?.proxyLogin || '');
		proxySection.appendChild(proxyLoginGroup);

		let proxyPasswordGroup = createFormGroup('proxyPassword', 'Пароль прокси', 'password', model?.proxyPassword || '');
		proxySection.appendChild(proxyPasswordGroup);

		form.appendChild(proxySection);

		// Other settings
		let settingsSection = document.createElement('div');
		settingsSection.className = 'formSection';

		let settingsTitle = document.createElement('h4');
		settingsTitle.textContent = 'Другие настройки';
		settingsSection.appendChild(settingsTitle);

		let timeoutGroup = createFormGroup('timeout', 'Таймаут (сек)', 'number', model?.timeout || 30);
		settingsSection.appendChild(timeoutGroup);

		let streamingGroup = createFormGroup('streaming', 'Потоковый режим', 'checkbox', model?.streaming !== false);
		settingsSection.appendChild(streamingGroup);

		form.appendChild(settingsSection);

		// Buttons
		let buttonsGroup = document.createElement('div');
		buttonsGroup.className = 'formButtons';

		let cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.className = 'cancelButton';
		cancelButton.textContent = 'Отмена';
		cancelButton.addEventListener('click', () => {
			document.body.removeChild(dialog);
		});
		buttonsGroup.appendChild(cancelButton);

		let saveButton = document.createElement('button');
		saveButton.type = 'submit';
		saveButton.className = 'saveButton';
		saveButton.textContent = model ? 'Сохранить' : 'Добавить';
		buttonsGroup.appendChild(saveButton);

		form.appendChild(buttonsGroup);

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			saveModel(form, model?.id);
			document.body.removeChild(dialog);
		});

		dialogContent.appendChild(form);
		dialog.appendChild(dialogContent);
		document.body.appendChild(dialog);
	} catch (error) {
		console.error(error);
	}
}

function createFormGroup(name, label, type, value, helpText = null) {
	let group = document.createElement('div');
	group.className = 'formGroup';

	if (helpText) {
		let helpElement = document.createElement('div');
		helpElement.className = 'formHelp';
		helpElement.textContent = helpText;
		group.appendChild(helpElement);
	}

	if (type === 'checkbox') {
		// Custom checkbox structure
		let checkboxContainer = document.createElement('label');
		checkboxContainer.className = 'checkboxContainer';
		checkboxContainer.htmlFor = name;

		let input = document.createElement('input');
		input.type = 'checkbox';
		input.id = name;
		input.name = name;
		input.checked = value;

		let checkmark = document.createElement('span');
		checkmark.className = 'checkmark';

		let labelSpan = document.createElement('span');
		labelSpan.className = 'checkboxLabel';
		labelSpan.textContent = label;

		checkboxContainer.appendChild(input);
		checkboxContainer.appendChild(checkmark);
		checkboxContainer.appendChild(labelSpan);

		group.appendChild(checkboxContainer);
	} else {
		// Regular input fields
		let labelElement = document.createElement('label');
		labelElement.textContent = label;
		labelElement.htmlFor = name;
		group.appendChild(labelElement);

		let input = document.createElement('input');
		input.type = type;
		input.id = name;
		input.name = name;
		input.value = value;

		group.appendChild(input);
	}

	return group;
}

function createFormGroupWithHelp(name, label, type, value, helpText) {
	return createFormGroup(name, label, type, value, helpText);
}

function saveModel(form, modelId) {
	try {
		let formData = new FormData(form);
		let modelData = {
			name: formData.get('name'),
			apiKey: formData.get('apiKey'),
			baseUrl: formData.get('baseUrl'),
			modelName: formData.get('modelName'),
			useProxy: formData.get('useProxy') === 'on',
			useSOCKS5: formData.get('useSOCKS5') === 'on',
			proxyIP: formData.get('proxyIP'),
			proxyPortHttps: parseInt(formData.get('proxyPortHttps')) || 0,
			proxyLogin: formData.get('proxyLogin'),
			proxyPassword: formData.get('proxyPassword'),
			timeout: parseInt(formData.get('timeout')) || 30,
			streaming: formData.get('streaming') === 'on'
		};

		vscode.postMessage({
			command: modelId ? 'updateModelRequest' : 'createModelRequest',
			modelData: modelData,
			modelId: modelId
		});
	} catch (error) {
		console.error(error);
	}
}

function deleteModel(modelId) {
	try {
		vscode.postMessage({
			command: 'deleteModelRequest',
			modelId: modelId
		});
	} catch (error) {
		console.error(error);
	}
}

// Response handlers
function getModelsListResponse(message) {
	updateModelsList(message.models);
}

function createModelResponse(message) {
	loadModelsList();
}

function updateModelResponse(message) {
	loadModelsList();
}

function deleteModelResponse(message) {
	loadModelsList();
}
