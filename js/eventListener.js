
window.addEventListener('message', async event => {
	try {
		let message = event.data;
		switch (message.command) {
			case 'toHomeButtonOnClickResponse':
				toHomeButtonOnClickResponse(message);
				// Update models data if provided
				if (message.modelsData) {
					window.modelsData = message.modelsData;
				}
				updateHeader();
				break;
			case 'conversationSendTextButtonOnClickResponse':
				conversationSendTextButtonOnClickResponse(message);
				break;
			case 'deleteChatButtonOnClickResponse':
				deleteChatButtonOnClickResponse(message);
				break;
			case 'addChatButtonOnClickResponse':
				addChatButtonOnClickResponse(message);
				break;
			case 'loadViewOnLoadResponse':
				// Initialize localization
				if (message.localization) {
					window.localization.init(message.localization);
				}
				// Store models data globally
				if (message.modelsData) {
					window.modelsData = message.modelsData;
				}
				if (message.currentChatID == -1){
					goToHome();
					updateHeader();
				}else{
					clickToOpenConversationButton(message.currentChatID);
					updateHeader();
				}
				break;
			case 'clickToOpenConversationButtonResponse':
				createConversationBody(message);
				updateHeader();
				break;
			case 'streamingMessageUpdate':
				streamingMessageUpdate(message);
				break;
			case 'streamingComplete':
				streamingComplete(message);
				break;
			case 'getModelsListResponse':
				getModelsListResponse(message);
				break;
			case 'createModelResponse':
				createModelResponse(message);
				break;
			case 'updateModelResponse':
				updateModelResponse(message);
				break;
			case 'deleteModelResponse':
				deleteModelResponse(message);
				break;
			case 'deleteMessageResponse':
				deleteMessageResponse(message);
				break;
			default:
				console.error(message);
				break;
	}
	} catch (error) {
		console.error(error);
	}
});

document.addEventListener('DOMContentLoaded', function() {
	try {
		hljs.registerLanguage("vue", window.hljsDefineVue);
		hljs.initHighlightingOnLoad();
		marked.setOptions({
			highlight: function(code, lang) {
				let language = hljs.getLanguage(lang) ? lang : 'markdown';

				return hljs.highlight(code, { language }).value;
			}
		});
		loadViewOnLoadRequest();
	} catch (error) {
		console.error(error);
	}
});