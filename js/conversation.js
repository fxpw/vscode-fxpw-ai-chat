

function scrollСhatHistoryContainerToBottom() {
	const chatHistoryContainer = document.getElementById('chatHistoryContainer');
	chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
}
let intervalIdForConversationSendTextButton = 0;

function intervalChangeSendQueryText(){
	let conversationSendTextButton = document.getElementById('conversationSendTextButton')
	conversationSendTextButton.textContent = 'Process...';
	conversationSendTextButton.disabled = true;
	let dots = 3;
	const updateButtonText = () => {
		let text = 'Process' + '.'.repeat(dots);
		conversationSendTextButton.textContent = text;
		dots = (dots + 1) % 4; // Циклично изменяем количество точек от 0 до 3
	};
	updateButtonText();
	intervalIdForConversationSendTextButton = setInterval(updateButtonText, 900);
}


function conversationSendTextButtonOnClick(){
	intervalChangeSendQueryText();
	let conversationTextToSendInput = document.getElementById('conversationTextToSendInput');
	let query = conversationTextToSendInput.value;
	conversationTextToSendInput.value ="";
	let chatHistoryElement = document.createElement('div');
	chatHistoryElement.className = "chatHistoryElement userMargin";
	chatHistoryElement.innerHTML = marked.parse(query);
	let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
	if (codeBlocks){
		codeBlocks.forEach((block) => {
			hljs.highlightElement(block);
			let copyButton = document.createElement('button');
			copyButton.textContent = 'copy';
			copyButton.className = 'copyButton';
			copyButton.type = 'button';
			copyButton.addEventListener('click', () => {
				navigator.clipboard.writeText(block.textContent).then(() => {
					copyButton.textContent = 'done!';
					setTimeout(() => copyButton.textContent = 'copy', 2000);
				}).catch(err => console.error('js//conversation.js error: ', err));
			});
			block.parentNode.insertBefore(copyButton, block);
		});
	}
	let chatHistoryContainer = document.getElementById('chatHistoryContainer');

	chatHistoryContainer.appendChild(chatHistoryElement);
	vscode.postMessage({
		command: 'conversationSendTextButtonOnClickRequest',
		text: query,
		chatID : CURRENT_CHAT_ID,
	});
}


// eslint-disable-next-line no-unused-vars
function createConversationBody(chatData) {
	// Очищаем содержимое элемента body перед обновлением
	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';
	// Создаем элементы для беседы
	let conversationContainer = document.createElement('div');
	conversationContainer.id = 'conversationContainer';
	conversationContainer.className = 'conversationContainer';
	// chat history container
	let chatHistoryContainer = document.createElement('div');
	chatHistoryContainer.id = 'chatHistoryContainer';
	chatHistoryContainer.className = "chatHistoryContainer";
	// chat history container elements
	chatData.conversation.forEach(messageData => {
		let chatHistoryElement = document.createElement('div');
		if (messageData.role == "user") {
			chatHistoryElement.className = "chatHistoryElement userMargin";
		} else {
			chatHistoryElement.className = "chatHistoryElement nonuserMargin";
		}
		// chatHistoryElement.textContent = messageData.message;
		chatHistoryElement.innerHTML = marked.parse(messageData.content);
		let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
		if (codeBlocks){
			codeBlocks.forEach((block) => {
				hljs.highlightElement(block);
				let copyButton = document.createElement('button');
				copyButton.textContent = 'copy';
				copyButton.className = 'copyButton';
				copyButton.type = 'button';
				copyButton.addEventListener('click', () => {
					navigator.clipboard.writeText(block.textContent).then(() => {
						copyButton.textContent = 'done!';
						setTimeout(() => copyButton.textContent = 'copy', 2000);
					}).catch(err => console.error('js//conversation.js error: ', err));
				});
				block.parentNode.insertBefore(copyButton, block);
			});
		}
		chatHistoryContainer.appendChild(chatHistoryElement);
	});
	// input text area
	let conversationTextToSendInput = document.createElement('textarea');
	conversationTextToSendInput.id = 'conversationTextToSendInput';
	conversationTextToSendInput.className = "conversationTextareaToSendInput";
	conversationTextToSendInput.type = 'text';
	conversationTextToSendInput.placeholder = 'Type your message...';
	conversationTextToSendInput.addEventListener('keydown', function(event) {
		let conversationSendTextButton = document.getElementById('conversationSendTextButton');
		if (event.key === 'Enter' && !event.shiftKey && conversationSendTextButton && !conversationSendTextButton.disabled) {
			event.preventDefault();
			conversationSendTextButtonOnClick();
		}
	});
	// send button
	let conversationSendTextButton = document.createElement('button');
	conversationSendTextButton.id = 'conversationSendTextButton';
	conversationSendTextButton.className = "conversationSendTextButton";
	conversationSendTextButton.textContent = 'Send';
	conversationSendTextButton.addEventListener('click', function () {
		conversationSendTextButtonOnClick();
	});

	conversationContainer.appendChild(chatHistoryContainer);
	conversationContainer.appendChild(conversationTextToSendInput);
	conversationContainer.appendChild(conversationSendTextButton);

	bodyElement.appendChild(conversationContainer);
	scrollСhatHistoryContainerToBottom();
}

// eslint-disable-next-line no-unused-vars
function conversationSendTextButtonOnClickResponse(message) {

	let chatData = message.chatData;

	let chatHistoryContainer = document.getElementById('chatHistoryContainer');
	chatHistoryContainer.innerHTML = "";
	chatData.conversation.forEach(messageData => {
		let chatHistoryElement = document.createElement('div');
		if (messageData.role == "user") {
			chatHistoryElement.className = "chatHistoryElement userMargin";
		} else {
			chatHistoryElement.className = "chatHistoryElement nonuserMargin";
		}
		chatHistoryElement.innerHTML = marked.parse(messageData.content);
		let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
		if (codeBlocks){
			codeBlocks.forEach((block) => {
				hljs.highlightElement(block);
				let copyButton = document.createElement('button');
				copyButton.textContent = 'copy';
				copyButton.className = 'copyButton';
				copyButton.type = 'button';
				copyButton.addEventListener('click', () => {
					navigator.clipboard.writeText(block.textContent).then(() => {
						copyButton.textContent = 'done!';
						setTimeout(() => copyButton.textContent = 'copy', 2000);
					}).catch(err => console.error('js//conversation.js error: ', err));
				});
				block.parentNode.insertBefore(copyButton, block);
			});
		}
		chatHistoryContainer.appendChild(chatHistoryElement);
	});

	const conversationSendTextButton = document.getElementById('conversationSendTextButton');
	conversationSendTextButton.textContent = 'Send';
	conversationSendTextButton.disabled = false;
	clearInterval(intervalIdForConversationSendTextButton);
}
