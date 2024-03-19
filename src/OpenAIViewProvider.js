const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const {OpenAI} = require("./OpenAI.js");
const {ExtensionSettings} = require("./ExtensionSettings.js");

async function getHtmlForWebview(webview, extensionUri) {
	const homeFilePath = path.join(extensionUri.fsPath, "html", 'index.html');
	const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
	try {
		let htmlContent = await fs.readFile(homeFilePath, { encoding: 'utf8' });
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
				vscode.Uri.joinPath(OpenAIViewProvider._extensionUri, 'images'),
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
				// console.log(message);
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
						let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
						webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData : OpenAI.getChatsListData(),newChatID:newChatID });
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

module.exports = { OpenAIViewProvider }