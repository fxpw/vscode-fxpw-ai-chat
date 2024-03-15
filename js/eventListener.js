
window.addEventListener('message', event => {
	let message = event.data;
	console.log(message.command);
	switch (message.command) {
		case 'toHomeButtonOnClickResponse':
			toHomeButtonOnClickResponse(message);
			break;
		case 'conversationSendTextButtonOnClickResponse':
			conversationSendTextButtonOnClickResponse(message);
			break;
		case 'add_chat':
			break;
		case 'delete_chat':
			break;
		case 'update_chat':
			break;
		case 'update_home':
			break;
		case 'addChatButtonOnClickResponse':
			addChatButtonOnClickResponse(message);
			break;
		case 'requestToOpenAIResponse':
			// if (message.response.trim() !== '') { // Проверяем, не пуст ли ответ
			// 	responseElement.innerHTML = marked.parse(message.response);
			// 	let codeBlocks = responseElement.querySelectorAll('pre code');
			// 	if (codeBlocks){
			// 		codeBlocks.forEach((block) => {
			// 			hljs.highlightElement(block);
			// 			let copyButton = document.createElement('button');
			// 			copyButton.textContent = 'copy';
			// 			copyButton.className = 'copyButton';
			// 			copyButton.type = 'button';
			// 			copyButton.addEventListener('click', () => {
			// 				navigator.clipboard.writeText(block.textContent).then(() => {
			// 					copyButton.textContent = 'done!';
			// 					setTimeout(() => copyButton.textContent = 'copy', 2000);
			// 				}).catch(err => console.error('html/webviewContent.html error: ', err));
			// 			});
			// 			block.parentNode.insertBefore(copyButton, block);
			// 		});
			// 	}
			// 	responseElement.style.display = 'block';
			// } else {
			// 	responseElement.style.display = 'none';
			// }
			// sendQueryButton.textContent = 'Send';
			// sendQueryButton.disabled = false;
			// clearInterval(intervalid);
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