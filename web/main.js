const https_proxy_agent = require("https-proxy-agent");

const openai_lib = require("openai");


async function getHtmlForWebview(webview, extensionUri) {
	const homeFilePath = vscode.path.join(extensionUri.fsPath, "html", 'index.html');
	const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
	try {
		let htmlContent = await vscode.fs.readFile(homeFilePath, { encoding: 'utf8' });
		htmlContent = htmlContent.replace(/<link rel="stylesheet" href="..\/css\//g, `<link rel="stylesheet" href="${cssUri}/`);
        htmlContent = htmlContent.replace(/<script src="..\/js\//g, `<script src="${jsUri}/`);
		return htmlContent;
	} catch (error) {
		console.error('Error reading HTML file:', error);
		return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
	}
}

class OpenAIViewProvider {
	static _extensionUri;
	static _context;
	static _token;
	static _webviewView;
	constructor(context) {
		OpenAIViewProvider._extensionUri = context.extensionUri;
		OpenAIViewProvider._context = context;
		// this._token = null;
	}

	resolveWebviewView(webviewView, context, token) {
		OpenAIViewProvider._context = context;
		OpenAIViewProvider._token = token;
		OpenAIViewProvider._webviewView = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(OpenAIViewProvider._extensionUri, 'css'),
				vscode.Uri.joinPath(OpenAIViewProvider._extensionUri, 'js'),
			]
		};

		getHtmlForWebview(webviewView.webview, OpenAIViewProvider._extensionUri)
		.then(htmlContent => {
			webviewView.webview.html = htmlContent;
		})
		.catch(error => {
			console.error(error);
		});

		webviewView.webview.onDidReceiveMessage(async message => {
			try {
				// let chatsListData; // Declare once
				// let currentChatData; // Declare once
				console.log(message);
				switch (message.command) {
					case 'conversationSendTextButtonOnClickRequest':
						await OpenAI.request(message);
						if (OpenAI.getCurrentChat()>0){
							webviewView.webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
						}else{
							webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
						}
						break;
					case 'addChatButtonOnClickRequest':
						await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
						webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
						break;
					case 'deleteChatButtonOnClickRequest':
						await OpenAI.deleteChatDataByID(message);
						await OpenAI.setCurrentChatID(-1);
						webviewView.webview.postMessage({ command: 'deleteChatButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
						break;
					case 'toHomeButtonOnClickRequest':
						await OpenAI.setCurrentChatID(-1);
						webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
						break;
					case 'clickToOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID:message.chatID  });
						break;
					case 'loadViewOnLoadRequest':
						webviewView.webview.postMessage({ command: 'loadViewOnLoadResponse', chatsListData : OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
						break;
					case 'doWTFCodeNewChatResponseOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'doWTFCodeNewChatResponseOpenConversationButtonResponse', chatsListData : OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
						break;
					default:
						console.error(message);
						break;
			}
			} catch (error) {
				console.error(error);
			}
			
		});
	}

	static Init(context){
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'vscode-fxpw-ai-chat-view',
				new OpenAIViewProvider(context)
			)
		);
	}
}

class OpenAI{
	// eslint-disable-next-line no-unused-vars
	static async request(messageData,webview,needPreUpdate,needPostUpdate) {
		try {
			// let newChatID = messageData.chatID;
			await ExtensionData.setCurrentChatID(messageData.chatID);
			let conversationSendTextButtonOnClickData = {
				"role":"user",
				"content":messageData.text,
			}
			
			let agent = false;
			if(ExtensionSettings.PROXY_URL){
				agent = new https_proxy_agent.HttpsProxyAgent(ExtensionSettings.PROXY_URL);
			}
			let openai = new openai_lib.OpenAI({
				apiKey : ExtensionSettings.OPENAI_KEY,
				httpAgent:agent ? agent : null,
			});
			await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData,messageData.chatID);
			let newChatData = ExtensionData.getChatDataByID(messageData.chatID);
			await ExtensionData.blockChatByID(messageData.chatID);
			if(webview && needPreUpdate){
				try {
					if (OpenAI.getCurrentChat()==messageData.chatID){
						webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID:messageData.chatID });
						// webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
					}else if(OpenAI.getCurrentChat()==-1) {
						webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
					}
				} catch (error) {
					console.error(error);
				}
			}
			const chatCompletion = await openai.chat.completions.create({
				messages: newChatData.conversation,
				model: ExtensionSettings.OPENAI_MODEL,
			});
			if(chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content){
				let conversationAIData = {
					"role":"assistant",
					"content":chatCompletion.choices[0].message.content,
				}
				await ExtensionData.addDataToChatById(conversationAIData,messageData.chatID);
			}
		} catch (error) {
			let conversationAIData = {
				"role":"assistant",
				"content":error.message,
			}
			await ExtensionData.addDataToChatById(conversationAIData,messageData.chatID);
		} finally{
			await ExtensionData.unblockChatByID(messageData.chatID);
			if (webview && needPostUpdate){
				try {
					if (OpenAI.getCurrentChat()==messageData.chatID){
						webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID:messageData.chatID });
						// webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
					}else if(OpenAI.getCurrentChat()==-1) {
						webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
	}

	static getChatsListData(){
		return ExtensionData.chatsData;
	}
	static getCurrentChatData(){
		return ExtensionData.getCurrentChatData();
	}
	static getCurrentChat(){
		return ExtensionData.currentChatID;
	}
	static async deleteChatDataByID(messageData){
		try {
			return await ExtensionData.deleteChatDataByID(messageData.chatID);
		} catch (error) {
			console.error(error);
		}
	}
	static async createNewChat(model){
		try {
			return await ExtensionData.createNewChat(model);
		} catch (error) {
			console.error(error);
		}
	}
	static async deleteAllChatsData(){
		try {
			return await ExtensionData.deleteAllChatsData();
		} catch (error) {
			console.error(error);
		}
	}
	static async setCurrentChatID(id){
		try {
			return await ExtensionData.setCurrentChatID(id);
		} catch (error) {
			console.error(error);
		}
	}
}


class ExtensionSettings {
	static get config() {
		return vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
	}

	static get PROXY_IP() {
		return ExtensionSettings.config.get('proxyIP');
	};

	static get PROXY_PORT_HTTPS() {
		return ExtensionSettings.config.get('proxyPortHttps');
	};

	static get PROXY_LOGIN() {
		return ExtensionSettings.config.get('proxyLogin');
	};

	static get PROXY_PASSWORD() {
		return ExtensionSettings.config.get('proxyPassword');
	};

	static get OPENAI_KEY() {
		return ExtensionSettings.config.get('openAIKey');
	};

	static get OPENAI_MODEL() {
		return ExtensionSettings.config.get('openAIModel');
	};

	static get PROXY_URL() {
		if (ExtensionSettings.PROXY_LOGIN && ExtensionSettings.PROXY_PASSWORD && ExtensionSettings.PROXY_IP && ExtensionSettings.PROXY_PORT_HTTPS ){
			return `http://${ExtensionSettings.PROXY_LOGIN}:${ExtensionSettings.PROXY_PASSWORD}@${ExtensionSettings.PROXY_IP}:${ExtensionSettings.PROXY_PORT_HTTPS}`;
		}
	};

	static UpdateSettingsHandler() {
		try {
			
		} catch (error) {
			console.error(error);
		}
	}
	// eslint-disable-next-line no-unused-vars
	static Init(context){
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('vscode-fxpw-ai-chat')) {
				ExtensionSettings.UpdateSettingsHandler();
			}
		});
	}
} 

class ExtensionData {
	static #chatsData = [];
	static #context = null;

	static get currentChatID() {
		return this.#context.globalState.get('currentChatID', -1);
	}

	static async setCurrentChatID(newParam) {
		try {
			await this.#context.globalState.update('currentChatID', newParam);
		} catch (error) {
			console.error(error);
		}
	}

	static get iteratorForChatID() {
		return this.#context.globalState.get('iteratorForChatID', 0);
	}

	static async addIteratorForChatID() {
		try {
			let lastIterator = this.iteratorForChatID;
			lastIterator++;
			await this.#context.globalState.update('iteratorForChatID', lastIterator);
			
		} catch (error) {
			console.error(error);
		}
	}

	static get chatsData() {
		return this.#chatsData;
	};

	static async saveChatsData() {
		try {
			await this.#context.globalState.update('chatsData', this.#chatsData);
		} catch (error) {
			console.error(error);
		}
	};

	static async createNewChat(model){
		try {
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			let new_chat = {};
			new_chat.conversation = [
			];
			new_chat.name = "click ME !";
			new_chat.createAt = timestamp;
			new_chat.id = this.iteratorForChatID;
			new_chat.lastUpdate = timestamp;
			new_chat.needRenameOnRequest = true;
			new_chat.model = model;
			new_chat.isBlocked=false;

			this.#chatsData.push(new_chat);
			await this.addIteratorForChatID();
			await this.saveChatsData();
			return new_chat.id;
		} catch (error) {
			console.error(error);
		}
	}

	static async addDataToCurrentChat(data){
		try {
			let currentChatData = await this.getCurrentChatData();
			if(currentChatData && currentChatData.needRenameOnRequest && data.role == "user" && data.content){
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			currentChatData.lastUpdate = timestamp;
			await this.saveChatsData();
			
		} catch (error) {
			console.error(error);
		}
	}
	static async addDataToChatById(data,chatID){
		try {
			let currentChatData = this.getChatDataByID(chatID);
			if(currentChatData && currentChatData.needRenameOnRequest && data.role == "user" && data.content){
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			currentChatData.lastUpdate = timestamp;
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static async deleteChatDataByID(chatID){
		try {
			this.#chatsData.forEach((element, index) => {
				if (element.id === chatID ) {
					if(!element.isBlocked){
						this.#chatsData = this.#chatsData.filter((_, i) => i !== index);
					}
				};
			});
			await this.setCurrentChatID(-1);
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static getCurrentChatData(){
		try {
			let dataToReturn = [];
			this.#chatsData.forEach((element, index) => {
				if (element.id === this.currentChatID) {
					dataToReturn = this.#chatsData.filter((_, i) => i === index);
				}
			});
			return dataToReturn[0];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	static getChatDataByID(chatID){
		try {
			let dataToReturn = [];
			this.#chatsData.forEach((element, index) => {
				if (element.id === chatID) {
					dataToReturn = this.#chatsData.filter((_, i) => i === index);
				}
			});
			return dataToReturn[0];
		} catch (error) {
			console.error(error);
			return [];
		}
	}
	static async blockChatByID(chatID){
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				element.isBlocked = true;
			}
		});
		await this.saveChatsData();
	}
	static async unblockChatByID(chatID){
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				element.isBlocked = false;
			}
		});
		await this.saveChatsData();
	}

	static async deleteAllChatsData(){
		this.#chatsData = [];
		await this.saveChatsData();
	}

	/**
	 * @static
	 * @async
	 * @param {vscode.ExtensionContext} context
	 */
	static Init(context) {
		this.#context = context;
		this.#chatsData = this.#context.globalState.get('chatsData', []);
		// this.#chatsData = []
	};

}


class ExtensionCommands{
	static Init(context) {
		let openSettingsCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', function () {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
				// console.log('vscode-fxpw-ai-chat config open');
			}, (err) => {
				vscode.window.showErrorMessage('error: ' + err);
			});
		});
		context.subscriptions.push(openSettingsCommand);

		let WTFCodeNewChatCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.WTFCodeNewChat',async function () {
			try {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					vscode.window.showInformationMessage('Нет активного редактора');
					return;
				}

				const selection = editor.selection;
				const text = editor.document.getText(selection);

				let promt = `Объясни: ${text}`
				let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
				let messageData = {
					text: promt,
					chatID : newChatID,
				}
				await OpenAI.request(messageData,OpenAIViewProvider._webviewView.webview,true,true);
				vscode.window.showInformationMessage(`Запрос обработан:${promt}`);

			} catch (error) {
				console.error(error);
			}
			
		});
		context.subscriptions.push(WTFCodeNewChatCommand);

		let deleteAllChatsData = vscode.commands.registerCommand('vscode-fxpw-ai-chat.deleteAllChatsData',async function () {
			try {
				await OpenAI.deleteAllChatsData();
			} catch (error) {
				console.error(error);
			}
			
		});
		context.subscriptions.push(deleteAllChatsData);
	};
}





function activate(context) {
	try {
		ExtensionData.Init(context);
		ExtensionSettings.Init(context);
		ExtensionCommands.Init(context);
		OpenAIViewProvider.Init(context);
		console.log("vscode-fxpw-ai-chat loaded");
	} catch (error) {
		console.error(91,error);
	}
}



exports.activate = activate;
