let toHomeButton = document.getElementById('toHomeButton');

function toHomeButtonOnClick(){
	vscode.postMessage({
		command: 'toHomeButtonOnClickRequest',
	});
}

function goToHome(){
	toHomeButtonOnClick();
	console.log("js/toHomeButton.js");
}

function updateBodyAfterToHomeButtonOnClickResponse(chatsListData) {
    let bodyElement = document.getElementById('body');

    bodyElement.innerHTML = '';

    chatsListData.forEach(function(chat) {
		let button = createConversationButton(chat);
        bodyElement.appendChild(button);
    });
}


function toHomeButtonOnClickResponse(message){
	let chatsListData = message.chatsListData.reverse();
	updateBodyAfterToHomeButtonOnClickResponse(chatsListData);
}

toHomeButton.addEventListener('click', () => {
	toHomeButtonOnClick();
});

