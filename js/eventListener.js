
window.addEventListener('message', event => {
	let message = event.data;
	// console.log(message.command);
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
		default:
			break;
	}
});

document.addEventListener('DOMContentLoaded', function() {
	// document.getElementById('response').style.display = 'none';
	marked.setOptions({
		highlight: function(code, lang) {
			let language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	});
	goToHome();
});