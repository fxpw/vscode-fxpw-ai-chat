

function toHomeButtonOnClick() {
	try {
		vscode.postMessage({
			command: 'toHomeButtonOnClickRequest',
		});
		CURRENT_CHAT_ID=-1;
		IN_CHAT = false;
		IS_CHAT_BLOCKED=false;
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function goToHome() {
	toHomeButtonOnClick();
}

// eslint-disable-next-line no-unused-vars
function toHomeButtonOnClickResponse(message) {
	try {
		let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		updateConversationsList(sortedChatsDesc);
	} catch (error) {
		console.error(error);
	}
}


function addChatButtonOnClick(){
	try {
		vscode.postMessage({
			command: 'addChatButtonOnClickRequest',
		});
	} catch (error) {
		console.error(error);
	}
}

// eslint-disable-next-line no-unused-vars
function addChatButtonOnClickResponse(message){
	try {
		// let sortedChatsDesc = message.chatsListData.sort((a, b) => b.lastUpdate - a.lastUpdate);
		// updateConversationsList(sortedChatsDesc);
		clickToOpenConversationButton(message.newChatID);
	} catch (error) {
		console.error(error);
	}
}


function deleteChatButtonOnClick(){
	try {
		if (CURRENT_CHAT_ID>=0 &&!IS_CHAT_BLOCKED){
			vscode.postMessage({
				command: 'deleteChatButtonOnClickRequest',
				chatID: CURRENT_CHAT_ID,
			});
		}
	} catch (error) {
		console.error(error);
	}

}

// eslint-disable-next-line no-unused-vars
function deleteChatButtonOnClickResponse(message){
	goToHome();
}


// eslint-disable-next-line no-unused-vars
function updateHeader(){
	try {
		let headerDiv = document.getElementById('header');
		headerDiv.innerHTML=""
		let svgNS = "http://www.w3.org/2000/svg";
		
		if (IN_CHAT){
			let toHomeButton = document.createElement('button');
			toHomeButton.id = 'toHomeButton';
			toHomeButton.className = 'headerButton';
			let svgElementHome = document.createElementNS(svgNS, "svg");
			svgElementHome.setAttribute("width", "24");
			svgElementHome.setAttribute("height", "24");
			svgElementHome.setAttribute("viewBox", "0 0 24 24");
			svgElementHome.setAttribute("fill", "none");
			let pathElementHome = document.createElementNS(svgNS, "path");
			pathElementHome.setAttribute("d", "M3 9.5V21H21V9.5L12 2L3 9.5ZM11 12V18H13V12H11Z");
			pathElementHome.setAttribute("fill", "currentColor");
			svgElementHome.appendChild(pathElementHome);
			toHomeButton.appendChild(svgElementHome);

			toHomeButton.addEventListener('click', () => {
				toHomeButtonOnClick();
			});

			let spacer = document.createElement('div');
			spacer.className = 'spacer';

			let deleteChatButton = document.createElement('button');
			deleteChatButton.id = 'deleteChatButton';
			deleteChatButton.className = 'headerButton';
			let svgElementMinus = document.createElementNS(svgNS, "svg");
			svgElementMinus.setAttribute("width", "24");
			svgElementMinus.setAttribute("height", "24");
			svgElementMinus.setAttribute("viewBox", "0 0 24 24");
			svgElementMinus.setAttribute("fill", "none");
			let pathElementMinus = document.createElementNS(svgNS, "path");
			pathElementMinus.setAttribute("d", "M5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44771 13 4 12.5523 4 12C4 11.4477 4.44771 11 5 11Z");
			pathElementMinus.setAttribute("fill", "currentColor");
			svgElementMinus.appendChild(pathElementMinus);
			deleteChatButton.appendChild(svgElementMinus);
			deleteChatButton.addEventListener('click', () => {
				deleteChatButtonOnClick();
			});

			headerDiv.appendChild(toHomeButton);
			headerDiv.appendChild(spacer);
			headerDiv.appendChild(deleteChatButton);

		}else{

			let testChatButton = document.createElement('button');
			testChatButton.id = 'testChatButton';
			testChatButton.className = 'headerButton';
			testChatButton.addEventListener('click', () => {
				// test();
			});
			let svgElementTest = document.createElementNS(svgNS, "svg");
			svgElementTest.setAttribute("width", "24");
			svgElementTest.setAttribute("height", "24");
			svgElementTest.setAttribute("viewBox", "0 0 24 24");
			svgElementTest.setAttribute("fill", "none");
			let pathElementTest = document.createElementNS(svgNS, "path");
			pathElementTest.setAttribute("d", "M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44771 11 4 11.4477 4 12C4 12.5523 4.44771 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z");
			pathElementTest.setAttribute("fill", "currentColor");
			pathElementTest.appendChild(svgElementTest);
			testChatButton.appendChild(pathElementTest);

			let spacer = document.createElement('div');
			spacer.className = 'spacer';

			let addChatButton = document.createElement('button');
			addChatButton.id = 'addChatButton';
			addChatButton.className = 'headerButton';
			addChatButton.addEventListener('click', () => {
				addChatButtonOnClick();
			});
			let svgElementPlus = document.createElementNS(svgNS, "svg");
			svgElementPlus.setAttribute("width", "24");
			svgElementPlus.setAttribute("height", "24");
			svgElementPlus.setAttribute("viewBox", "0 0 24 24");
			svgElementPlus.setAttribute("fill", "none");
			let pathElementPlus = document.createElementNS(svgNS, "path");
			pathElementPlus.setAttribute("d", "M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44771 11 4 11.4477 4 12C4 12.5523 4.44771 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z");
			pathElementPlus.setAttribute("fill", "currentColor");
			svgElementPlus.appendChild(pathElementPlus);
			addChatButton.appendChild(svgElementPlus);

			
			headerDiv.appendChild(testChatButton);
			headerDiv.appendChild(spacer);
			headerDiv.appendChild(addChatButton);
		}

	} catch (error) {
		console.error(error);
	}
}