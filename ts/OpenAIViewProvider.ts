import * as vscode from 'vscode';
// import * as fs from 'fs/promises';
// import * as path from 'path';
import { OpenAI } from "./OpenAI";
import { ExtensionSettings } from "./ExtensionSettings";

async function getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): Promise<string> {
	const homeFilePath: vscode.Uri = vscode.Uri.joinPath(extensionUri, "html", 'index.html');
	const cssUri: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
	const jsUri: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
	try {
		const uint8ArrayContent: Uint8Array = await vscode.workspace.fs.readFile(homeFilePath);
		// let htmlContent: string = await vscode.workspace.fs.readFile(homeFilePath);
		const decoder = new TextDecoder('utf-8');
		let htmlContent: string = decoder.decode(uint8ArrayContent);
		htmlContent = htmlContent.replace(/<link rel="stylesheet" href="\.\.\/css\//g, `<link rel="stylesheet" href="${cssUri.toString()}/`);
		htmlContent = htmlContent.replace(/<script src="\.\.\/js\//g, `<script src="${jsUri.toString()}/`);
		return htmlContent;
	} catch (error) {
		console.error('Error reading HTML file:', error);
		return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
	}
}

class OpenAIViewProvider implements vscode.WebviewViewProvider {
	public static _extensionUri: vscode.Uri;
	public static _context: vscode.WebviewViewResolveContext<{}> | undefined;
	public static _token: vscode.CancellationToken | undefined;
	public static _webviewView: vscode.WebviewView;

	constructor(context: vscode.ExtensionContext) {
		OpenAIViewProvider._extensionUri = context.extensionUri;
	}

	public async resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<{}>, token: vscode.CancellationToken): Promise<void> {
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

		try {
			const htmlContent: string = await getHtmlForWebview(webviewView.webview, OpenAIViewProvider._extensionUri);
			webviewView.webview.html = htmlContent;
		} catch (error) {
			console.error(error);
		}

		this.initializeMessageListener(webviewView);
	}

	private initializeMessageListener(webviewView: vscode.WebviewView): void {
		webviewView.webview.onDidReceiveMessage(async message => {
			try {
				// let chatsListData; // Declare once
				// let currentChatData; // Declare once
				// console.log(message);
				switch (message.command) {
					case 'conversationSendTextButtonOnClickRequest':
						await OpenAI.request(message);
						if (OpenAI.getCurrentChat() > 0) {
							webviewView.webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
						} else {
							webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData: OpenAI.getChatsListData() });
						}
						break;
					case 'addChatButtonOnClickRequest':
						let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
						webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData: OpenAI.getChatsListData(), newChatID: newChatID });
						break;
					case 'deleteChatButtonOnClickRequest':
						await OpenAI.deleteChatDataByID(message);
						await OpenAI.setCurrentChatID(-1);
						webviewView.webview.postMessage({ command: 'deleteChatButtonOnClickResponse', chatsListData: OpenAI.getChatsListData() });
						break;
					case 'toHomeButtonOnClickRequest':
						await OpenAI.setCurrentChatID(-1);
						webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData: OpenAI.getChatsListData() });
						break;
					case 'clickToOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID: message.chatID });
						break;
					case 'loadViewOnLoadRequest':
						webviewView.webview.postMessage({ command: 'loadViewOnLoadResponse', chatsListData: OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
						break;
					case 'doWTFCodeNewChatResponseOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'doWTFCodeNewChatResponseOpenConversationButtonResponse', chatsListData: OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
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

	public static Init(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'vscode-fxpw-ai-chat-view',
				new OpenAIViewProvider(context)
			)
		);
	}
}

export { OpenAIViewProvider };
