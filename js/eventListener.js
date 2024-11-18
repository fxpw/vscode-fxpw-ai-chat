
window.addEventListener('message', async event => {
	try {
		let message = event.data;
		// console.log(message);
		switch (message.command) {
			case 'toHomeButtonOnClickResponse':
				toHomeButtonOnClickResponse(message);
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