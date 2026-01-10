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
						const wasStreaming = await OpenAI.request(message, webviewView.webview);
						if (!wasStreaming) {
							// Only send response if not streaming (streaming updates UI in real-time)
							if (OpenAI.getCurrentChat() > 0) {
								webviewView.webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
							} else {
								webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData: OpenAI.getChatsListData() });
							}
						}
						break;
					case 'createChatWithModelRequest':
						let newChatID = await OpenAI.createNewChat(message.modelId);
						webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData: OpenAI.getChatsListData(), newChatID: newChatID });
						break;
					case 'deleteChatButtonOnClickRequest':
						console.log('Received delete chat request for chat ID:', message.chatID);
						await OpenAI.deleteChatDataByID(message.chatID);
						await OpenAI.setCurrentChatID(-1);
						console.log('Chat deleted, sending response');
						webviewView.webview.postMessage({ command: 'deleteChatButtonOnClickResponse', chatsListData: OpenAI.getChatsListData() });
						break;
					case 'toHomeButtonOnClickRequest':
						await OpenAI.setCurrentChatID(-1);
						webviewView.webview.postMessage({
							command: 'toHomeButtonOnClickResponse',
							chatsListData: OpenAI.getChatsListData(),
							modelsData: OpenAI.getAllModels()
						});
						break;
					case 'clickToOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID: message.chatID });
						break;
					case 'loadViewOnLoadRequest':
						webviewView.webview.postMessage({
							command: 'loadViewOnLoadResponse',
							chatsListData: OpenAI.getChatsListData(),
							currentChatID: OpenAI.getCurrentChat(),
							modelsData: OpenAI.getAllModels()
						});
						break;
					case 'doWTFCodeNewChatResponseOpenConversationButtonRequest':
						await OpenAI.setCurrentChatID(message.chatID);
						webviewView.webview.postMessage({ command: 'doWTFCodeNewChatResponseOpenConversationButtonResponse', chatsListData: OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
						break;
					case 'changeInputTextRequest':
						// await OpenAI.setCurrentChatID(message.chatID);
						await OpenAI.changeInputText(message.inputText,message.chatID);
						// webviewView.webview.postMessage({ command: 'doWTFCodeNewChatResponseOpenConversationButtonResponse', chatsListData: OpenAI.getChatsListData(), currentChatID: OpenAI.getCurrentChat() });
						break;
					case 'deleteMessageRequest':
						const deleteSuccess = await OpenAI.deleteMessageFromChat(message.chatID, message.messageIndex);
						webviewView.webview.postMessage({
							command: 'deleteMessageResponse',
							chatID: message.chatID,
							messageIndex: message.messageIndex,
							success: deleteSuccess
						});
						break;
					case 'streamingMessageUpdate':
						// Forward streaming message to webview
						webviewView.webview.postMessage({
							command: 'streamingMessageUpdate',
							chatID: message.chatID,
							content: message.content
						});
						break;
					case 'streamingComplete':
						// Handle streaming completion
						webviewView.webview.postMessage({
							command: 'streamingComplete',
							chatID: message.chatID,
							chatData: message.chatData
						});
						break;
					case 'getModelsListRequest':
						webviewView.webview.postMessage({
							command: 'getModelsListResponse',
							models: OpenAI.getAllModels()
						});
						break;
					case 'createModelRequest':
						try {
							const newModel = await OpenAI.createModel(message.modelData);
							webviewView.webview.postMessage({
								command: 'createModelResponse',
								model: newModel
							});
						} catch (error) {
							console.error('Error creating model:', error);
						}
						break;
					case 'updateModelRequest':
						try {
							const updatedModel = await OpenAI.updateModel(message.modelId, message.modelData);
							webviewView.webview.postMessage({
								command: 'updateModelResponse',
								model: updatedModel
							});
						} catch (error) {
							console.error('Error updating model:', error);
						}
						break;
					case 'deleteModelRequest':
						try {
							const deleted = await OpenAI.deleteModel(message.modelId);
							webviewView.webview.postMessage({
								command: 'deleteModelResponse',
								success: deleted
							});
						} catch (error) {
							console.error('Error deleting model:', error);
						}
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
