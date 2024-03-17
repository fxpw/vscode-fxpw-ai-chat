
window.addEventListener('message', async event => {
	try {
		let message = event.data;
		console.log(message);
		switch (message.command) {
			case 'toHomeButtonOnClickResponse':
				toHomeButtonOnClickResponse(message);
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
				}else{
					clickToOpenConversationButton(message.currentChatID);
				}
				break;
			case 'clickToOpenConversationButtonResponse':
				createConversationBody(message)
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
		marked.setOptions({
			highlight: function(code, lang) {
				let language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		});
		loadViewOnLoadRequest();
	} catch (error) {
		console.error(error);
	}
});