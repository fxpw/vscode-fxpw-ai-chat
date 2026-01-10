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
		title.textContent = window.localization.t('modelManagement');
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
		addModelButton.textContent = window.localization.t('addModel');
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
			emptyMessage.textContent = window.localization.t('noModelsCreated');
			emptyMessage.className = 'emptyMessage';
			modelsList.appendChild(emptyMessage);
			return;
		}

		models.forEach(model => {
			// Создаем контейнер для модели и кнопки удаления
			let modelContainer = document.createElement('div');
			modelContainer.className = 'modelContainer';

			// Создаем кнопку модели
			let modelButton = document.createElement('button');
			modelButton.className = 'modelButton';

			let modelName = document.createElement('span');
			modelName.className = 'modelName';
			modelName.textContent = model.name;
			modelButton.appendChild(modelName);

			modelButton.appendChild(document.createElement('br'));

			let modelDetails = document.createElement('span');
			modelDetails.className = 'modelDetails';
			let detailsText = `${window.localization.t('modelLabel')}${model.modelName}`;
			if (model.baseUrl) {
				detailsText += ` | ${window.localization.t('urlLabel')}${model.baseUrl}`;
			}
			modelDetails.textContent = detailsText;
			modelButton.appendChild(modelDetails);

			modelButton.addEventListener('click', () => {
				showEditModelDialog(model);
			});

			// Создаем кнопку удаления
			let deleteModelButton = document.createElement('button');
			deleteModelButton.className = 'deleteModelButton';
			deleteModelButton.title = window.localization.t('delete');

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
			deleteModelButton.appendChild(svgElement);

			deleteModelButton.addEventListener('click', (event) => {
				event.stopPropagation(); // Предотвращаем клик по контейнеру
				deleteModel(model.id);
			});

			modelContainer.appendChild(modelButton);
			modelContainer.appendChild(deleteModelButton);
			modelsList.appendChild(modelContainer);
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
		title.textContent = model ? window.localization.t('editModel') : window.localization.t('addModelDialog');
		dialogContent.appendChild(title);

		let form = document.createElement('form');
		form.className = 'modelForm';

		// Display Name field
		let nameGroup = createFormGroupWithHelp('name', window.localization.t('name'), 'text', model?.name || '', window.localization.t('nameHelp'));
		form.appendChild(nameGroup);

		// API Key field
		let apiKeyGroup = createFormGroupWithHelp('apiKey', window.localization.t('apiKey'), 'password', model?.apiKey || '', window.localization.t('apiKeyHelp'));
		form.appendChild(apiKeyGroup);

		// Base URL field
		let baseUrlGroup = createFormGroupWithHelp('baseUrl', window.localization.t('baseURL'), 'text', model?.baseUrl || '', window.localization.t('baseURLHelp'));
		form.appendChild(baseUrlGroup);

		// Model Name field
		let modelNameGroup = createFormGroupWithHelp('modelName', window.localization.t('nameForRequest'), 'text', model?.modelName || 'gpt-4o-mini', window.localization.t('modelNameHelp'));
		form.appendChild(modelNameGroup);

		// Proxy settings
		let proxySection = document.createElement('div');
		proxySection.className = 'formSection';

		let proxyTitle = document.createElement('h4');
		proxyTitle.textContent = window.localization.t('proxySettings');
		proxySection.appendChild(proxyTitle);

		let useProxyGroup = createFormGroup('useProxy', window.localization.t('useProxy'), 'checkbox', model?.useProxy || false);
		proxySection.appendChild(useProxyGroup);

		let useSOCKS5Group = createFormGroup('useSOCKS5', window.localization.t('socks5Proxy'), 'checkbox', model?.useSOCKS5 || false);
		proxySection.appendChild(useSOCKS5Group);

		let proxyIPGroup = createFormGroup('proxyIP', window.localization.t('proxyIPAddress'), 'text', model?.proxyIP || '');
		proxySection.appendChild(proxyIPGroup);

		let proxyPortGroup = createFormGroup('proxyPortHttps', window.localization.t('proxyPort'), 'number', model?.proxyPortHttps || 0);
		proxySection.appendChild(proxyPortGroup);

		let proxyLoginGroup = createFormGroup('proxyLogin', window.localization.t('proxyLogin'), 'text', model?.proxyLogin || '');
		proxySection.appendChild(proxyLoginGroup);

		let proxyPasswordGroup = createFormGroup('proxyPassword', window.localization.t('proxyPassword'), 'password', model?.proxyPassword || '');
		proxySection.appendChild(proxyPasswordGroup);

		form.appendChild(proxySection);

		// Other settings
		let settingsSection = document.createElement('div');
		settingsSection.className = 'formSection';

		let settingsTitle = document.createElement('h4');
		settingsTitle.textContent = window.localization.t('otherSettings');
		settingsSection.appendChild(settingsTitle);

		let timeoutGroup = createFormGroup('timeout', window.localization.t('timeout'), 'number', model?.timeout || 30);
		settingsSection.appendChild(timeoutGroup);

		let streamingGroup = createFormGroup('streaming', window.localization.t('streamingMode'), 'checkbox', model?.streaming !== false);
		settingsSection.appendChild(streamingGroup);

		form.appendChild(settingsSection);

		// Buttons
		let buttonsGroup = document.createElement('div');
		buttonsGroup.className = 'formButtons';

		let cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.className = 'cancelButton';
		cancelButton.textContent = window.localization.t('cancel');
		cancelButton.addEventListener('click', () => {
			document.body.removeChild(dialog);
		});
		buttonsGroup.appendChild(cancelButton);

		let saveButton = document.createElement('button');
		saveButton.type = 'submit';
		saveButton.className = 'saveButton';
		saveButton.textContent = model ? window.localization.t('save') : window.localization.t('add');
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
