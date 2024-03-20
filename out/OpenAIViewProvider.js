"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIViewProvider = void 0;
const vscode = require("vscode");
// import * as fs from 'fs/promises';
// import * as path from 'path';
const OpenAI_1 = require("./OpenAI");
const ExtensionSettings_1 = require("./ExtensionSettings");
async function getHtmlForWebview(webview, extensionUri) {
    const homeFilePath = vscode.Uri.joinPath(extensionUri, "html", 'index.html');
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
    try {
        const uint8ArrayContent = await vscode.workspace.fs.readFile(homeFilePath);
        // let htmlContent: string = await vscode.workspace.fs.readFile(homeFilePath);
        const decoder = new TextDecoder('utf-8');
        let htmlContent = decoder.decode(uint8ArrayContent);
        htmlContent = htmlContent.replace(/<link rel="stylesheet" href="\.\.\/css\//g, `<link rel="stylesheet" href="${cssUri.toString()}/`);
        htmlContent = htmlContent.replace(/<script src="\.\.\/js\//g, `<script src="${jsUri.toString()}/`);
        return htmlContent;
    }
    catch (error) {
        console.error('Error reading HTML file:', error);
        return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
    }
}
class OpenAIViewProvider {
    constructor(context) {
        OpenAIViewProvider._extensionUri = context.extensionUri;
    }
    async resolveWebviewView(webviewView, context, token) {
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
            const htmlContent = await getHtmlForWebview(webviewView.webview, OpenAIViewProvider._extensionUri);
            webviewView.webview.html = htmlContent;
        }
        catch (error) {
            console.error(error);
        }
        this.initializeMessageListener(webviewView);
    }
    initializeMessageListener(webviewView) {
        webviewView.webview.onDidReceiveMessage(async (message) => {
            try {
                // let chatsListData; // Declare once
                // let currentChatData; // Declare once
                // console.log(message);
                switch (message.command) {
                    case 'conversationSendTextButtonOnClickRequest':
                        await OpenAI_1.OpenAI.request(message);
                        if (OpenAI_1.OpenAI.getCurrentChat() > 0) {
                            webviewView.webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI_1.OpenAI.getCurrentChatData() });
                        }
                        else {
                            webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData() });
                        }
                        break;
                    case 'addChatButtonOnClickRequest':
                        let newChatID = await OpenAI_1.OpenAI.createNewChat(ExtensionSettings_1.ExtensionSettings.OPENAI_MODEL);
                        webviewView.webview.postMessage({ command: 'addChatButtonOnClickResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData(), newChatID: newChatID });
                        break;
                    case 'deleteChatButtonOnClickRequest':
                        await OpenAI_1.OpenAI.deleteChatDataByID(message);
                        await OpenAI_1.OpenAI.setCurrentChatID(-1);
                        webviewView.webview.postMessage({ command: 'deleteChatButtonOnClickResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData() });
                        break;
                    case 'toHomeButtonOnClickRequest':
                        await OpenAI_1.OpenAI.setCurrentChatID(-1);
                        webviewView.webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData() });
                        break;
                    case 'clickToOpenConversationButtonRequest':
                        await OpenAI_1.OpenAI.setCurrentChatID(message.chatID);
                        webviewView.webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI_1.OpenAI.getCurrentChatData(), currentChatID: message.chatID });
                        break;
                    case 'loadViewOnLoadRequest':
                        webviewView.webview.postMessage({ command: 'loadViewOnLoadResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData(), currentChatID: OpenAI_1.OpenAI.getCurrentChat() });
                        break;
                    case 'doWTFCodeNewChatResponseOpenConversationButtonRequest':
                        await OpenAI_1.OpenAI.setCurrentChatID(message.chatID);
                        webviewView.webview.postMessage({ command: 'doWTFCodeNewChatResponseOpenConversationButtonResponse', chatsListData: OpenAI_1.OpenAI.getChatsListData(), currentChatID: OpenAI_1.OpenAI.getCurrentChat() });
                        break;
                    default:
                        console.error(message);
                        break;
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    static Init(context) {
        context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscode-fxpw-ai-chat-view', new OpenAIViewProvider(context)));
    }
}
exports.OpenAIViewProvider = OpenAIViewProvider;
//# sourceMappingURL=OpenAIViewProvider.js.map