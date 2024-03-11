
const vscode = require("vscode");
// const axios =  require('axios');
// const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
// const openai_lib = require("openai");
const fs = require('fs').promises;
const path = require('path');

const {ExtensionData} = require("./ExtensionData.js");
const {ExtensionSettings} = require("./ExtensionSettings.js");
const {OpenAI} = require("./OpenAI.js");

async function getHtmlForWebview(webview, extensionUri) {
	const homeFilePath = path.join(extensionUri.fsPath, "html", 'index.html');
	const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
	try {
		let htmlContent = await fs.readFile(homeFilePath, { encoding: 'utf8' });
		htmlContent = htmlContent.replace(/<link rel="stylesheet" href="..\/css\//g, `<link rel="stylesheet" href="${cssUri}/`);
        htmlContent = htmlContent.replace(/<script src="..\/js\//g, `<script src="${jsUri}/`);
		// console.log(jsUri);
		return htmlContent;
	} catch (error) {
		console.error('Error reading HTML file:', error);
		return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
	}
}

class OpenAIViewProvider {
	constructor(context) {
		this._extensionUri = context.extensionUri;
	}

	resolveWebviewView(webviewView, context, token) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'css'),
				vscode.Uri.joinPath(this._extensionUri, 'js'),
				// Добавьте другие директории при необходимости
			]
		};

		getHtmlForWebview(webviewView.webview, this._extensionUri)
		.then(htmlContent => {
			webviewView.webview.html = htmlContent;
		})
		.catch(error => {
			console.error(error);
		});

		webviewView.webview.onDidReceiveMessage(async message => {
			// console.log(message.command);
			let chatsListData; // Declare once
			console.log(message.command);
			switch (message.command) {
				case 'requestToOpenAIRequest':
					let response_text_from_openai = await OpenAI.request(message.text);
					webviewView.webview.postMessage({ command: 'requestToOpenAIResponse', chatData:{} });
					break;
				case 'addChatButtonOnClickRequest':
					await OpenAI.createNewChat();
					chatsListData = await OpenAI.getChatsListData();
					webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData : chatsListData });
					break;
				case 'toHomeButtonOnClickRequest':
					chatsListData = await OpenAI.getChatsListData();
					webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : chatsListData });
					break;
			}
		});
	}
}

function activate(context) {
	try {
		ExtensionData.Init(context);
		ExtensionSettings.Init();
		
		let disposable = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', function () {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
				console.log('vscode-fxpw-ai-chat config open');
			}, (err) => {
				vscode.window.showErrorMessage('error: ' + err);
			});
		});
		context.subscriptions.push(disposable);

		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'vscode-fxpw-ai-chat-view',
				new OpenAIViewProvider(context)
			)
		);

		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('vscode-fxpw-ai-chat')) {
				ExtensionSettings.UpdateSettingsHandler();
			}
		});
	} catch (error) {
		console.error(91,error);
	}
	

}



exports.activate = activate;
