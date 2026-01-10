
let intervalIdForConversationSendTextButton = 0;
// function cleanHtml(html) {
// 	return html.replace(/(<p>)+|(<\/p>)+/g, '<p>').replace(/(<p>\s*<\/p>)+/g, ''); // Убираем лишние <p>
// }

function createDeleteMessageButton(messageId) {
	try {
		let deleteButton = document.createElement('button');
		deleteButton.className = 'deleteMessageButton';
		deleteButton.title = 'Delete message';
		deleteButton.setAttribute('data-message-id', messageId);

		let svgNS = "http://www.w3.org/2000/svg";
		let svgElement = document.createElementNS(svgNS, "svg");
		svgElement.setAttribute("width", "14");
		svgElement.setAttribute("height", "14");
		svgElement.setAttribute("viewBox", "0 0 24 24");
		svgElement.setAttribute("fill", "none");
		let pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", "M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20");
		pathElement.setAttribute("stroke", "currentColor");
		pathElement.setAttribute("stroke-width", "2");
		pathElement.setAttribute("stroke-linecap", "round");
		pathElement.setAttribute("stroke-linejoin", "round");
		svgElement.appendChild(pathElement);
		deleteButton.appendChild(svgElement);

		deleteButton.addEventListener('click', () => {
			vscode.postMessage({
				command: 'deleteMessageRequest',
				chatID: CURRENT_CHAT_ID,
				messageId: messageId
			});
		});

		return deleteButton;
	} catch (error) {
		console.error(error);
		return null;
	}
}


// function decodeHtml(html) {
// 	let textArea = document.createElement('textarea');
// 	textArea.innerHTML = html;
// 	return textArea.value;
// }

// Функция для обработки тегов мыслей модели <think> и </think>
function processThinkingTags(text, isStreaming = false) {
	try {
		let processed = text;

		// Для потокового режима обрабатываем каждый <think> как отдельный блок
		if (isStreaming) {
			// Считаем количество открытых и закрытых тегов
			const openTags = (text.match(/<think>/gi) || []).length;
			const closeTags = (text.match(/<\/think>/gi) || []).length;

			// Заменяем <think> на открывающий блок
			processed = processed.replace(/<think>/gi, '<div class="thinking-block"><div class="thinking-header">🤔 Think</div><div class="thinking-content">');

			// Заменяем </think> на закрывающий блок
			processed = processed.replace(/<\/think>/gi, '</div></div>');

			// Если есть незакрытые теги (больше открытых чем закрытых), добавляем временный закрывающий блок
			if (openTags > closeTags) {
				processed += '</div></div>';
			}
		} else {
			// Для обычного режима (не потокового) обрабатываем как раньше
			processed = processed.replace(/<think>/gi, '<div class="thinking-block"><div class="thinking-header">🤔 Think</div><div class="thinking-content">');
			processed = processed.replace(/<\/think>/gi, '</div></div>');
		}

		return processed;
	} catch (error) {
		console.error('Ошибка обработки тегов мыслей:', error);
		return text;
	}
}

let editor = null;
function scrollСhatHistoryContainerToBottom() {
	try {
		const chatHistoryContainer = document.getElementById('chatHistoryContainer');
		chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
	} catch (error) {
		console.error(error);
	}

}

function intervalChangeSendQueryText() {
	try {
		IS_CHAT_BLOCKED = true;
		// Update EasyMDE toolbar send button if it exists
		let sendButton = document.querySelector('.editor-toolbar .fa-paper-plane');
		if (sendButton) {
			sendButton.parentElement.style.opacity = '0.5';
			sendButton.parentElement.style.pointerEvents = 'none';
		}
		let dots = 3;
		const updateButtonText = () => {
			let text = 'Process' + '.'.repeat(dots);
			// Update button title instead of text content
			if (sendButton) {
				sendButton.parentElement.title = text;
			}
			dots = (dots + 1) % 4;
		};
		updateButtonText();
		intervalIdForConversationSendTextButton = setInterval(updateButtonText, 900);
	} catch (error) {
		console.error(error);
	}
}

function conversationSendTextButtonOnClick() {
	try {
		intervalChangeSendQueryText();
		// let conversationTextToSendInput = document.getElementById('conversationTextToSendInput');
		// let query = conversationTextToSendInput.value;
		let query = editor.value();
		editor.value("");
		// $('#conversationTextToSendInput').summernote('reset');
		// Создаем контейнер для нового сообщения пользователя
		let messageContainer = document.createElement('div');
		messageContainer.className = 'messageContainer';

		let chatHistoryElement = document.createElement('div');
		chatHistoryElement.className = "chatHistoryElement userMargin";
		chatHistoryElement.innerHTML = marked.parse(processThinkingTags(query));
		let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
		if (codeBlocks) {
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

		// Для пользователя: сообщение слева (в новой структуре кнопка будет добавлена при следующем рендере)
		messageContainer.appendChild(chatHistoryElement);

		let chatHistoryContainer = document.getElementById('chatHistoryContainer');
		chatHistoryContainer.appendChild(messageContainer);
		vscode.postMessage({
			command: 'conversationSendTextButtonOnClickRequest',
			text: query,
			chatID: CURRENT_CHAT_ID,
		});
	} catch (error) {
		console.error(error);
	}

}


// eslint-disable-next-line no-unused-vars
function createConversationBody(message) {
	try {
		CURRENT_CHAT_ID = message.currentChatID;
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
		message.chatData.conversation.forEach((messageData, index) => {
			// Создаем контейнер для сообщения и кнопки удаления
			let messageContainer = document.createElement('div');
			messageContainer.className = 'messageContainer';
			messageContainer.setAttribute('data-message-id', messageData.id);

			// Создаем кнопку удаления
			let deleteButton = createDeleteMessageButton(messageData.id);
			if (deleteButton) {
				if (messageData.role == "user") {
					deleteButton.className += ' deleteMessageButtonUser';
				} else {
					deleteButton.className += ' deleteMessageButtonAI';
				}
			}

			// Создаем элемент сообщения
			let chatHistoryElement = document.createElement('div');
			if (messageData.role == "user") {
				chatHistoryElement.className = "chatHistoryElement userMargin";
			} else {
				chatHistoryElement.className = "chatHistoryElement nonuserMargin";
			}
			// chatHistoryElement.textContent = messageData.message;
			chatHistoryElement.innerHTML = marked.parse(processThinkingTags(messageData.content));
			let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
			if (codeBlocks) {
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

			// Добавляем элементы в контейнер в правильном порядке
			if (messageData.role == "user") {
				// Для пользователя: сообщение слева, кнопка справа
				messageContainer.appendChild(chatHistoryElement);
				if (deleteButton) messageContainer.appendChild(deleteButton);
			} else {
				// Для AI: кнопка слева, сообщение справа
				if (deleteButton) messageContainer.appendChild(deleteButton);
				messageContainer.appendChild(chatHistoryElement);
			}

			chatHistoryContainer.appendChild(messageContainer);
		});
		// input text area
		let conversationTextToSendInput = document.createElement('textarea');
		conversationTextToSendInput.id = 'conversationTextToSendInput';
		// conversationTextToSendInput.className = "summernote"; // Добавляем класс summernote
		// conversationTextToSendInput.placeholder = message.chatData.inputText;

		// let conversationTextToSendInput = document.createElement('textarea');
		// conversationTextToSendInput.id = 'conversationTextToSendInput';
		// conversationTextToSendInput.className = "conversationTextareaToSendInput";
		// conversationTextToSendInput.type = 'text';
		// conversationTextToSendInput.placeholder = 'Type your message...';
		// conversationTextToSendInput.addEventListener('keydown', function(event) {
		// 	let conversationSendTextButton = document.getElementById('conversationSendTextButton');
		// 	if (event.key === 'Enter' && !event.shiftKey && conversationSendTextButton && !conversationSendTextButton.disabled) {
		// 		event.preventDefault();
		// 		conversationSendTextButtonOnClick();
		// 	}
		// });

		conversationContainer.appendChild(chatHistoryContainer);
		conversationContainer.appendChild(conversationTextToSendInput);
		bodyElement.appendChild(conversationContainer);


		scrollСhatHistoryContainerToBottom();
		if (message.chatData.isBlocked) {
			intervalChangeSendQueryText();
		}
		// $('#conversationTextToSendInput').each(function () {
		// 	if (!$(this).hasClass('summernote-initialized')) {
		// 		$("#conversationTextToSendInput").summernote({
		// 			tabsize: 3,
		// 			height: 130,
		// 			// airMode: true,
		// 			toolbar: [
		// 				// ['style', ['style']],
		// 				['font', ['bold', 'italic', 'underline', 'clear']],
		// 				// ['fontname', ['fontname']],
		// 				// ['fontsize', ['fontsize']],
		// 				// ['color', ['color']],
		// 				['para', ['ul', 'ol']],
		// 				// ['height', ['height']],
		// 				// ['table', ['table']],
		// 				// ['insert', ['link', 'picture', 'video']],
		// 				// ['view', ['fullscreen', 'codeview', 'help']]
		// 			],
		// 			// fontsize: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '64', '82', '150'],
		// 			callbacks: {
		// 				onKeyup: function (event) {
		// 					let conversationSendTextButton = document.getElementById('conversationSendTextButton');
		// 					if (event.key === 'Enter' && !event.shiftKey && conversationSendTextButton && !conversationSendTextButton.disabled) {
		// 						event.preventDefault();
		// 						conversationSendTextButtonOnClick();
		// 					}
		// 				},
		// 				onChange: function (contents, $editable) {
		// 					let text = $editable.text();
		// 					let chatID = CURRENT_CHAT_ID;
		// 					vscode.postMessage({
		// 						command: 'changeInputTextRequest',
		// 						chatID: chatID,
		// 						inputText: text,
		// 					});

		// 				},

		// 			}
		// 		});
		// 		$('#conversationTextToSendInput').summernote('insertText', message.chatData.inputText);
		// 	}
		// })
		// eslint-disable-next-line no-undef
		editor = new EasyMDE({
			element: $("#conversationTextToSendInput")[0],
			autofocus: true,
			toolbar: [
				"clean-block",
				"|",
				"quote",
				"unordered-list",
				"ordered-list",
				"fullscreen",
				"|",
				{
					name: "send",
					action: function () {
						conversationSendTextButtonOnClick();
					},
					className: "fa fa-paper-plane",
					// text: "📤",
					title: "Send Message (Ctrl+Enter)"
				}
			],
			lineWrapping: true,
			minHeight: "100px",
			maxHeight: "100px",
			placeholder: "Type here...",
			status: false,
			tabSize: 4,
			shortcuts: {
				"send": "Ctrl-Enter"
			}
		});


	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function streamingMessageUpdate(message) {
	try {
		let chatHistoryContainer = document.getElementById('chatHistoryContainer');

		// Find or create streaming message container
		let streamingContainer = chatHistoryContainer.querySelector('.streaming-container');

		if (!streamingContainer) {
			// Create new streaming message container if it doesn't exist
			streamingContainer = document.createElement('div');
			streamingContainer.className = 'messageContainer streaming-container';

			let streamingMessage = document.createElement('div');
			streamingMessage.className = 'chatHistoryElement nonuserMargin streaming-message';
			streamingMessage.setAttribute('data-chat-id', message.chatID);

			// Для AI: кнопка слева, сообщение справа (но для streaming кнопка не нужна)
			streamingContainer.appendChild(streamingMessage);
			chatHistoryContainer.appendChild(streamingContainer);
		}

		let streamingMessage = streamingContainer.querySelector('.streaming-message');

		// Update content
		streamingMessage.innerHTML = marked.parse(processThinkingTags(message.content || '', true));

		// Re-apply syntax highlighting to code blocks
		let codeBlocks = streamingMessage.querySelectorAll('pre code');
		if (codeBlocks) {
			codeBlocks.forEach((block) => {
				hljs.highlightElement(block);
				// Add copy button if not already exists
				if (!block.parentNode.querySelector('.copyButton')) {
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
				}
			});
		}

		scrollСhatHistoryContainerToBottom();
	} catch (error) {
		console.error(error);
	}
}

function streamingComplete(message) {
	try {
		let chatHistoryContainer = document.getElementById('chatHistoryContainer');
		let streamingContainer = chatHistoryContainer.querySelector('.streaming-container');
		let streamingMessage = streamingContainer ? streamingContainer.querySelector('.streaming-message') : null;

		if (streamingMessage) {
			// Convert streaming message to regular message
			streamingMessage.classList.remove('streaming-message');
			// Remove streaming container class
			if (streamingContainer) {
				streamingContainer.classList.remove('streaming-container');
			}
		}

		// Reset EasyMDE toolbar send button
		let sendButton = document.querySelector('.editor-toolbar .fa-paper-plane');
		if (sendButton) {
			sendButton.parentElement.style.opacity = '1';
			sendButton.parentElement.style.pointerEvents = 'auto';
			sendButton.parentElement.title = 'Send Message (Ctrl+Enter)';
		}

		IS_CHAT_BLOCKED = false;
		clearInterval(intervalIdForConversationSendTextButton);

		scrollСhatHistoryContainerToBottom();
	} catch (error) {
		console.error(error);
	}
}

function conversationSendTextButtonOnClickResponse(message) {
	try {
		let chatData = message.chatData;
		let chatHistoryContainer = document.getElementById('chatHistoryContainer');

		// Check if we have a streaming message that needs to be converted to regular message
		let streamingMessage = chatHistoryContainer.querySelector('.streaming-message');
		if (streamingMessage) {
			// Convert streaming message to regular message
			streamingMessage.classList.remove('streaming-message');
		} else {
			// No streaming was used, recreate all messages
			chatHistoryContainer.innerHTML = "";
			chatData.conversation.forEach((messageData, index) => {
				// Создаем контейнер для сообщения и кнопки удаления
				let messageContainer = document.createElement('div');
				messageContainer.className = 'messageContainer';
				messageContainer.setAttribute('data-message-id', messageData.id);

				// Создаем кнопку удаления
				let deleteButton = createDeleteMessageButton(messageData.id);
				if (deleteButton) {
					if (messageData.role == "user") {
						deleteButton.className += ' deleteMessageButtonUser';
					} else {
						deleteButton.className += ' deleteMessageButtonAI';
					}
				}

				// Создаем элемент сообщения
				let chatHistoryElement = document.createElement('div');
				if (messageData.role == "user") {
					chatHistoryElement.className = "chatHistoryElement userMargin";
				} else {
					chatHistoryElement.className = "chatHistoryElement nonuserMargin";
				}
				chatHistoryElement.innerHTML = marked.parse(processThinkingTags(messageData.content));
				let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
				if (codeBlocks) {
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

				// Добавляем элементы в контейнер в правильном порядке
				if (messageData.role == "user") {
					// Для пользователя: сообщение слева, кнопка справа
					messageContainer.appendChild(chatHistoryElement);
					if (deleteButton) messageContainer.appendChild(deleteButton);
				} else {
					// Для AI: кнопка слева, сообщение справа
					if (deleteButton) messageContainer.appendChild(deleteButton);
					messageContainer.appendChild(chatHistoryElement);
				}

				chatHistoryContainer.appendChild(messageContainer);
			});
		}
		// Reset EasyMDE toolbar send button
		let sendButton = document.querySelector('.editor-toolbar .fa-paper-plane');
		if (sendButton) {
			sendButton.parentElement.style.opacity = '1';
			sendButton.parentElement.style.pointerEvents = 'auto';
			sendButton.parentElement.title = 'Send Message (Ctrl+Enter)';
		}
		IS_CHAT_BLOCKED = false;
		clearInterval(intervalIdForConversationSendTextButton);
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function deleteMessageResponse(message) {
	try {
		if (message.success) {
			let chatHistoryContainer = document.getElementById('chatHistoryContainer');

			// Найти контейнер по messageId и удалить его
			let containerToRemove = chatHistoryContainer.querySelector(`.messageContainer[data-message-id="${message.messageId}"]`);
			if (containerToRemove) {
				containerToRemove.remove();
			}
		}
	} catch (error) {
		console.error(error);
	}
}
