
const vscode = require("vscode");
const axios =  require('axios');
const https_proxy_agent = require("https-proxy-agent");
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();

const fs = require('fs').promises;
const path = require('path');



async function getHtmlForWebview(webview, extensionUri) {
	const htmlFilePath = path.join(extensionUri.fsPath, "html", 'webviewContent.html');
	try {
		const htmlContent = await fs.readFile(htmlFilePath, { encoding: 'utf8' });
		return htmlContent;
	} catch (error) {
		console.error('Error reading HTML file:', error);
		return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
	}
}

async function queryOpenAI(query) {
	let config = vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
	let PROXY_IP = config.get('proxyIP');
	let PROXY_PORT_HTTPS = config.get('proxyPortHttps');
	let PROXY_LOGIN = config.get('proxyLogin');
	let PROXY_PASSWORD = config.get('proxyPassword');
	let OPENAI_KEY = config.get('openAIKey');
	let OPENAI_MODEL = config.get('openAIModel');
	// let proxyUrl = `http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT_HTTPS}`;
	let options = {
		headers: {
			'Authorization': `Bearer ${OPENAI_KEY}`,
			'Content-Type': 'application/json',
		}
	};
	if (!OPENAI_KEY || !OPENAI_MODEL) {
		vscode.commands.executeCommand('vscode-fxpw-ai-chat.openSettings').then(() => {
			console.log('Settings opened');
		}, (err) => {
			console.error('Failed to open settings: ', err);
		});
		return "No OPENAI_KEY or OPENAI_MODEL set in the extension config";
	}
	// Проверяем, заданы ли все параметры прокси
	if (PROXY_IP && PROXY_PORT_HTTPS && PROXY_LOGIN && PROXY_PASSWORD) {
		let proxyUrl = `http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT_HTTPS}`;
		let agent = new https_proxy_agent.HttpsProxyAgent(proxyUrl);
		options.httpsAgent = agent; // Используем прокси только если все параметры заданы
	}

	let requestUrl = `https://api.openai.com/v1/chat/completions`;
	try {
		const response = await axios.post(requestUrl, {
			model: OPENAI_MODEL,
			messages: [{"role": "user", "content": query}], // Исправлено на правильную структуру
			temperature: 0.7 // Добавлен параметр temperature, если необходим
		},options);
		if (response.data.choices && response.data.choices.length > 0) {
			return response.data.choices[0].message.content;
		} else {
			return 'No answer';
		}
	} catch (error) {
		console.error('Error while requesting OpenAI:', error);
		// throw new Error('An error occurred while contacting OpenAI.');
		return 'Error while requesting OpenAI';
	}
}

class OpenAIViewProvider {
	constructor(extensionUri) {
		this._extensionUri = extensionUri;
	}

	resolveWebviewView(webviewView, context, token) {
		webviewView.webview.options = {
			enableScripts: true
		};

		getHtmlForWebview(webviewView, this._extensionUri)
		.then(htmlContent => {
			webviewView.webview.html = htmlContent;
		})
		.catch(error => {
			console.error(error);
		});

		webviewView.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'queryOpenAI':
					// const response_text = await queryOpenAI(message.text);
					// webviewView.webview.postMessage({ command: 'response', response: response_text });
					const response_text = await queryOpenAI(message.text);
					const markdownResponse = `${response_text}`;
					const htmlResponse = md.render(markdownResponse);
					// console.log(response_text);
					webviewView.webview.postMessage({ command: 'response', response: htmlResponse });
					break;
			}
		});
	}
}

function activate(context) {
	
	let disposable = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', function () {
		vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
			console.log('Config open');
		}, (err) => {
			vscode.window.showErrorMessage('error: ' + err);
		});
	});
	context.subscriptions.push(disposable);


	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'vscode-fxpw-ai-chat-view',
			new OpenAIViewProvider(context.extensionUri)
		)
	);
	
}



exports.activate = activate;
