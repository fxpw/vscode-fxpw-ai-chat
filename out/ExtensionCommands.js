"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionCommands = void 0;
const vscode = require("vscode");
const OpenAI_1 = require("./OpenAI"); // Предположим, что OpenAI уже переписан на TypeScript
const OpenAIViewProvider_1 = require("./OpenAIViewProvider"); // Предположим, что OpenAIViewProvider уже переписан на TypeScript
const ExtensionSettings_1 = require("./ExtensionSettings"); // Предположим, что ExtensionSettings уже переписан на TypeScript
class ExtensionCommands {
    static Init(context) {
        let openSettingsCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
                // console.log('vscode-fxpw-ai-chat config open');
            }, (err) => {
                vscode.window.showErrorMessage('error: ' + err);
            });
        });
        context.subscriptions.push(openSettingsCommand);
        let WTFCodeNewChatCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.WTFCodeNewChat', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Нет активного редактора');
                    return;
                }
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                let prompt = `Объясни: ${text}`;
                let newChatID = await OpenAI_1.OpenAI.createNewChat(ExtensionSettings_1.ExtensionSettings.OPENAI_MODEL);
                let messageData = {
                    text: prompt,
                    chatID: newChatID,
                };
                await OpenAI_1.OpenAI.request(messageData, OpenAIViewProvider_1.OpenAIViewProvider._webviewView.webview, true, true);
                vscode.window.showInformationMessage(`Запрос обработан:${prompt}`);
            }
            catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(WTFCodeNewChatCommand);
        let deleteAllChatsData = vscode.commands.registerCommand('vscode-fxpw-ai-chat.deleteAllChatsData', async () => {
            try {
                await OpenAI_1.OpenAI.deleteAllChatsData();
            }
            catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(deleteAllChatsData);
    }
}
exports.ExtensionCommands = ExtensionCommands;
//# sourceMappingURL=ExtensionCommands.js.map