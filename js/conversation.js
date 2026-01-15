
let intervalIdForConversationSendTextButton = 0;
// function cleanHtml(html) {
// 	return html.replace(/(<p>)+|(<\/p>)+/g, '<p>').replace(/(<p>\s*<\/p>)+/g, ''); // Убираем лишние <p>
// }

function createEditMessageButton(messageId) {
	try {
		let editButton = document.createElement('button');
		editButton.className = 'editMessageButton';
		editButton.title = 'Edit message';
		editButton.setAttribute('data-message-id', messageId);

		let svgNS = "http://www.w3.org/2000/svg";
		let svgElement = document.createElementNS(svgNS, "svg");
		svgElement.setAttribute("width", "14");
		svgElement.setAttribute("height", "14");
		svgElement.setAttribute("viewBox", "0 0 24 24");
		svgElement.setAttribute("fill", "none");
		let pathElement = document.createElementNS(svgNS, "path");
		pathElement.setAttribute("d", "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7");
		pathElement.setAttribute("stroke", "currentColor");
		pathElement.setAttribute("stroke-width", "2");
		pathElement.setAttribute("stroke-linecap", "round");
		pathElement.setAttribute("stroke-linejoin", "round");
		svgElement.appendChild(pathElement);

		let pathElement2 = document.createElementNS(svgNS, "path");
		pathElement2.setAttribute("d", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z");
		pathElement2.setAttribute("stroke", "currentColor");
		pathElement2.setAttribute("stroke-width", "2");
		pathElement2.setAttribute("stroke-linecap", "round");
		pathElement2.setAttribute("stroke-linejoin", "round");
		svgElement.appendChild(pathElement2);

		editButton.appendChild(svgElement);

		editButton.addEventListener('click', () => {
			startMessageEdit(messageId);
		});

		return editButton;
	} catch (error) {
		console.error(error);
		return null;
	}
}

function startMessageEdit(messageId) {
	try {
		// Find the message container
		let messageContainer = document.querySelector(`[data-message-id="${messageId}"]`);
		if (!messageContainer) return;

		let messageContent = messageContainer.querySelector('.messageContent');
		let chatHistoryElement = messageContent.querySelector('.chatHistoryElement');

		// Get original content (plain text from markdown)
		let originalContent = chatHistoryElement.textContent || chatHistoryElement.innerText || '';

		// Hide the original message content
		chatHistoryElement.style.display = 'none';

		// Hide action buttons during editing
		let actionButtons = messageContent.querySelector('.messageActionButtons');
		if (actionButtons) actionButtons.style.display = 'none';

		// Create edit container
		let editContainer = document.createElement('div');
		editContainer.className = 'messageEditContainer';

		// Create textarea for editing
		let editTextarea = document.createElement('textarea');
		editTextarea.className = 'messageEditTextarea';
		editTextarea.value = originalContent;
		editTextarea.rows = 4;
		editContainer.appendChild(editTextarea);

		// Create buttons container
		let buttonsContainer = document.createElement('div');
		buttonsContainer.className = 'messageEditButtons';

		// Save button
		let saveButton = document.createElement('button');
		saveButton.className = 'messageEditSave';
		saveButton.textContent = window.localization.t('save');
		saveButton.addEventListener('click', () => {
			let newContent = editTextarea.value.trim();
			if (newContent) {
				vscode.postMessage({
					command: 'updateMessageRequest',
					chatID: CURRENT_CHAT_ID,
					messageId: messageId,
					newContent: newContent
				});
			}
			cancelMessageEdit(messageId);
		});
		buttonsContainer.appendChild(saveButton);

		// Cancel button
		let cancelButton = document.createElement('button');
		cancelButton.className = 'messageEditCancel';
		cancelButton.textContent = window.localization.t('cancel');
		cancelButton.addEventListener('click', () => {
			cancelMessageEdit(messageId);
		});
		buttonsContainer.appendChild(cancelButton);

		editContainer.appendChild(buttonsContainer);

		// Add edit container to message content
		messageContent.appendChild(editContainer);

		// Focus on textarea
		setTimeout(() => editTextarea.focus(), 100);

	} catch (error) {
		console.error('Error starting message edit:', error);
	}
}

function cancelMessageEdit(messageId) {
	try {
		let messageContainer = document.querySelector(`[data-message-id="${messageId}"]`);
		if (!messageContainer) return;

		let messageContent = messageContainer.querySelector('.messageContent');
		let chatHistoryElement = messageContent.querySelector('.chatHistoryElement');
		let editContainer = messageContent.querySelector('.messageEditContainer');
		let actionButtons = messageContent.querySelector('.messageActionButtons');

		// Show original content and buttons, remove edit container
		if (chatHistoryElement) chatHistoryElement.style.display = '';
		if (actionButtons) actionButtons.style.display = '';
		if (editContainer) editContainer.remove();

	} catch (error) {
		console.error('Error canceling message edit:', error);
	}
}

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
		messageContainer.className = 'messageContainer user';

		// Создаем внутренний контейнер для сообщения и кнопки
		let messageContent = document.createElement('div');
		messageContent.className = 'messageContent';

		let chatHistoryElement = document.createElement('div');
		chatHistoryElement.className = "chatHistoryElement userMargin";
		chatHistoryElement.innerHTML = marked.parse(processThinkingTags(query));
		let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
		if (codeBlocks) {
			codeBlocks.forEach((block) => {
				hljs.highlightElement(block);
				let copyButton = document.createElement('button');
				copyButton.textContent = window.localization.t('copy');
				copyButton.className = 'copyButton';
				copyButton.type = 'button';
				copyButton.addEventListener('click', () => {
					navigator.clipboard.writeText(block.textContent).then(() => {
						copyButton.textContent = window.localization.t('done');
						setTimeout(() => copyButton.textContent = 'copy', 2000);
					}).catch(err => console.error('js//conversation.js error: ', err));
				});
				block.parentNode.insertBefore(copyButton, block);
			});
		}

		// Генерируем постоянный ID для сообщения
		let messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
		messageContainer.setAttribute('data-message-id', messageId);

		// Создаем контейнер для кнопок действий
		let actionButtonsContainer = document.createElement('div');
		actionButtonsContainer.className = 'messageActionButtons';

		// Создаем кнопку редактирования
		let editButton = createEditMessageButton(messageId);
		if (editButton) actionButtonsContainer.appendChild(editButton);

		// Создаем кнопку удаления
		let deleteButton = createDeleteMessageButton(messageId);
		if (deleteButton) actionButtonsContainer.appendChild(deleteButton);

		messageContent.appendChild(chatHistoryElement);
		messageContent.appendChild(actionButtonsContainer);
		messageContainer.appendChild(messageContent);

		let chatHistoryContainer = document.getElementById('chatHistoryContainer');
		chatHistoryContainer.appendChild(messageContainer);
		vscode.postMessage({
			command: 'conversationSendTextButtonOnClickRequest',
			text: query,
			chatID: CURRENT_CHAT_ID,
			messageId: messageId,
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
			// Создаем контейнер для сообщения
			let messageContainer = document.createElement('div');
			messageContainer.className = 'messageContainer ' + (messageData.role == "user" ? 'user' : (messageData.role == "system" ? 'system' : 'ai'));
			messageContainer.setAttribute('data-message-id', messageData.id);

			// Создаем внутренний контейнер для сообщения и кнопки
			let messageContent = document.createElement('div');
			messageContent.className = 'messageContent';

			// Создаем элемент сообщения
			let chatHistoryElement = document.createElement('div');
			if (messageData.role == "user") {
				chatHistoryElement.className = "chatHistoryElement userMargin";
			} else if (messageData.role == "system") {
				chatHistoryElement.className = "chatHistoryElement systemMargin";
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
					copyButton.textContent = window.localization.t('copy');
					copyButton.className = 'copyButton';
					copyButton.type = 'button';
					copyButton.addEventListener('click', () => {
						navigator.clipboard.writeText(block.textContent).then(() => {
							copyButton.textContent = window.localization.t('done');
							setTimeout(() => copyButton.textContent = 'copy', 2000);
						}).catch(err => console.error('js//conversation.js error: ', err));
					});
					block.parentNode.insertBefore(copyButton, block);
				});
			}

			// Создаем контейнер для кнопок действий
			let actionButtonsContainer = document.createElement('div');
			actionButtonsContainer.className = 'messageActionButtons';

			// Создаем кнопку редактирования для всех сообщений
			let editButton = createEditMessageButton(messageData.id);
			if (editButton) actionButtonsContainer.appendChild(editButton);

			// Создаем кнопку удаления для всех сообщений
			let deleteButton = createDeleteMessageButton(messageData.id);
			if (deleteButton) actionButtonsContainer.appendChild(deleteButton);

			// Добавляем элементы: сначала сообщение, потом кнопки действий снизу
			messageContent.appendChild(chatHistoryElement);
			messageContent.appendChild(actionButtonsContainer);

			messageContainer.appendChild(messageContent);
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
			streamingContainer.className = 'messageContainer ai streaming-container';

			let messageContent = document.createElement('div');
			messageContent.className = 'messageContent';

			let streamingMessage = document.createElement('div');
			streamingMessage.className = 'chatHistoryElement nonuserMargin streaming-message';
			streamingMessage.setAttribute('data-chat-id', message.chatID);

			messageContent.appendChild(streamingMessage);
			streamingContainer.appendChild(messageContent);
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
					copyButton.textContent = window.localization.t('copy');
					copyButton.className = 'copyButton';
					copyButton.type = 'button';
					copyButton.addEventListener('click', () => {
						navigator.clipboard.writeText(block.textContent).then(() => {
							copyButton.textContent = window.localization.t('done');
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

			// Find the AI message ID from chatData
			let aiMessageId = null;
			if (message.chatData && message.chatData.conversation) {
				// Find the last assistant message
				for (let i = message.chatData.conversation.length - 1; i >= 0; i--) {
					if (message.chatData.conversation[i].role === 'assistant') {
						aiMessageId = message.chatData.conversation[i].id;
						break;
					}
				}
			}

			// Add action buttons to the message content
			if (aiMessageId && streamingContainer) {
				let messageContent = streamingContainer.querySelector('.messageContent');
				if (messageContent && !messageContent.querySelector('.messageActionButtons')) {
					// Создаем контейнер для кнопок действий
					let actionButtonsContainer = document.createElement('div');
					actionButtonsContainer.className = 'messageActionButtons';

					// Создаем кнопку редактирования
					let editButton = createEditMessageButton(aiMessageId);
					if (editButton) actionButtonsContainer.appendChild(editButton);

					// Создаем кнопку удаления
					let deleteButton = createDeleteMessageButton(aiMessageId);
					if (deleteButton) actionButtonsContainer.appendChild(deleteButton);

					messageContent.appendChild(actionButtonsContainer);
				}
			}

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
				// Создаем контейнер для сообщения
				let messageContainer = document.createElement('div');
				messageContainer.className = 'messageContainer ' + (messageData.role == "user" ? 'user' : (messageData.role == "system" ? 'system' : 'ai'));
				messageContainer.setAttribute('data-message-id', messageData.id);

				// Создаем внутренний контейнер для сообщения и кнопки
				let messageContent = document.createElement('div');
				messageContent.className = 'messageContent';

				// Создаем элемент сообщения
				let chatHistoryElement = document.createElement('div');
				if (messageData.role == "user") {
					chatHistoryElement.className = "chatHistoryElement userMargin";
				} else if (messageData.role == "system") {
					chatHistoryElement.className = "chatHistoryElement systemMargin";
				} else {
					chatHistoryElement.className = "chatHistoryElement nonuserMargin";
				}
				chatHistoryElement.innerHTML = marked.parse(processThinkingTags(messageData.content));
				let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
				if (codeBlocks) {
					codeBlocks.forEach((block) => {
						hljs.highlightElement(block);
						let copyButton = document.createElement('button');
						copyButton.textContent = window.localization.t('copy');
						copyButton.className = 'copyButton';
						copyButton.type = 'button';
						copyButton.addEventListener('click', () => {
							navigator.clipboard.writeText(block.textContent).then(() => {
								copyButton.textContent = window.localization.t('done');
								setTimeout(() => copyButton.textContent = 'copy', 2000);
							}).catch(err => console.error('js//conversation.js error: ', err));
						});
						block.parentNode.insertBefore(copyButton, block);
					});
				}

				// Создаем контейнер для кнопок действий
				let actionButtonsContainer = document.createElement('div');
				actionButtonsContainer.className = 'messageActionButtons';

				// Создаем кнопку редактирования для всех сообщений
				let editButton = createEditMessageButton(messageData.id);
				if (editButton) actionButtonsContainer.appendChild(editButton);

				// Создаем кнопку удаления для всех сообщений
				let deleteButton = createDeleteMessageButton(messageData.id);
				if (deleteButton) actionButtonsContainer.appendChild(deleteButton);

				// Добавляем элементы: сначала сообщение, потом кнопки действий снизу
				messageContent.appendChild(chatHistoryElement);
				messageContent.appendChild(actionButtonsContainer);

				messageContainer.appendChild(messageContent);
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
	// Удаление обрабатывается через conversationSendTextButtonOnClickResponse
	// который перерисовывает все сообщения с обновленными данными
	} catch (error) {
		console.error(error);
	}
}

// eslint-disable-next-line no-unused-vars
function updateMessageContentResponse(message) {
	try {
		// Find the message container
		let messageContainer = document.querySelector(`[data-message-id="${message.messageId}"]`);
		if (!messageContainer) return;

		let messageContent = messageContainer.querySelector('.messageContent');
		let chatHistoryElement = messageContent.querySelector('.chatHistoryElement');

		// Update message content
		if (chatHistoryElement) {
			chatHistoryElement.innerHTML = marked.parse(processThinkingTags(message.newContent));
			let codeBlocks = chatHistoryElement.querySelectorAll('pre code');
			if (codeBlocks) {
				codeBlocks.forEach((block) => {
					hljs.highlightElement(block);
					let copyButton = document.createElement('button');
					copyButton.textContent = window.localization.t('copy');
					copyButton.className = 'copyButton';
					copyButton.type = 'button';
					copyButton.addEventListener('click', () => {
						navigator.clipboard.writeText(block.textContent).then(() => {
							copyButton.textContent = window.localization.t('done');
							setTimeout(() => copyButton.textContent = 'copy', 2000);
						}).catch(err => console.error('js//conversation.js error: ', err));
					});
					block.parentNode.insertBefore(copyButton, block);
				});
			}
		}

		// Exit edit mode and restore buttons
		cancelMessageEdit(message.messageId);

	} catch (error) {
		console.error(error);
	}
}
