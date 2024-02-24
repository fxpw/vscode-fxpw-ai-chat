
const vscode = require("vscode");
// const axios =  require('axios');
const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const openai_lib = require("openai");
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
let config = vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
let PROXY_IP = config.get('proxyIP');
let PROXY_PORT_HTTPS = config.get('proxyPortHttps');
let PROXY_LOGIN = config.get('proxyLogin');
let PROXY_PASSWORD = config.get('proxyPassword');
let OPENAI_KEY = config.get('openAIKey');
let OPENAI_MODEL = config.get('openAIModel');


let options = {
	headers: {
		'Authorization': `Bearer ${OPENAI_KEY}`,
		'Content-Type': 'application/json',
	}
};
let proxyUrl = `http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT_HTTPS}`;
let agent = new https_proxy_agent.HttpsProxyAgent(proxyUrl);

let openai = new openai_lib.OpenAI({
	apiKey : OPENAI_KEY,
	httpAgent:agent,
});

async function queryOpenAI(query) {
	
	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: query }],
		model: OPENAI_MODEL,
	});
	console.log(chatCompletion);
	return chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content;

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
					const response_text = await queryOpenAI(message.text);
					webviewView.webview.postMessage({ command: 'response', response: response_text });
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
