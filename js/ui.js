
// eslint-disable-next-line no-unused-vars
// let vscode_webview = require("vscode-webview");

// let vscode = acquireVsCodeApi();
// let intervalid = 0;



// let addChatButton = document.getElementById('addChatButton');
// let deleteChatButton = document.getElementById('deleteChatButton');
// let toHomeButton = document.getElementById('toHomeButton');




// let sendQueryButton = document.getElementById('sendQueryButton');
// let queryInput = document.getElementById('queryInput');
// let responseElement = document.getElementById('response');


// function intervalChangeSendQueryText(){
// 	sendQueryButton.textContent = 'Process...';
// 	sendQueryButton.disabled = true;
// 	let dots = 3;
// 	const updateButtonText = () => {
// 		let text = 'Process' + '.'.repeat(dots);
// 		sendQueryButton.textContent = text;
// 		dots = (dots + 1) % 4;
// 	};
// 	updateButtonText();
// 	intervalid = setInterval(updateButtonText, 900);
// }

// function sendQueryButtonOnClick(){
// 	intervalChangeSendQueryText();
// 	vscode.postMessage({
// 		command: 'queryOpenAI',
// 		text: queryInput.value
// 	});
// }

// sendQueryButton.addEventListener('click', () => {
// 	sendQueryButtonOnClick();
// });

// queryInput.addEventListener('input', function() {
// 	this.style.height = 'auto';
// 	this.style.height = (this.scrollHeight) + 'px';
// });

// queryInput.addEventListener('keydown', function(event) {
// 	if (event.key === 'Enter' && !event.shiftKey && sendQueryButton && !sendQueryButton.disabled) {
// 		event.preventDefault();
// 		sendQueryButtonOnClick();
// 	}
// });
