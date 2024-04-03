import * as vscode from 'vscode';
import { OpenAI } from './OpenAI'; // Предположим, что OpenAI уже переписан на TypeScript
import { OpenAIViewProvider } from './OpenAIViewProvider'; // Предположим, что OpenAIViewProvider уже переписан на TypeScript
import { ExtensionSettings } from './ExtensionSettings'; // Предположим, что ExtensionSettings уже переписан на TypeScript
interface MessageData {
    chatID: number;
    text: string;
}
class ExtensionCommands{
    static Init(context: vscode.ExtensionContext): void {
        let openSettingsCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
                // console.log('vscode-fxpw-ai-chat config open');
            }, (err) => {
                vscode.window.showErrorMessage('error: ' + err);
            });
        });
        context.subscriptions.push(openSettingsCommand);

        let explainCode = vscode.commands.registerCommand('vscode-fxpw-ai-chat.explainCode', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Нет активного редактора');
                    return;
                }

                const selection = editor.selection;
                const text = editor.document.getText(selection);

                let prompt = `Объясни:\n \`\`\`${text}\`\`\``;
                let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
                let messageData = {
                    text: prompt,
                    chatID: newChatID,
                };
                await OpenAI.request(messageData, OpenAIViewProvider._webviewView.webview, true, true);
                vscode.window.showInformationMessage(`Запрос обработан:${prompt}`);

            } catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(explainCode);
        let fixCode = vscode.commands.registerCommand('vscode-fxpw-ai-chat.fixCode', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Нет активного редактора');
                    return;
                }

                const selection = editor.selection;
                const text = editor.document.getText(selection);

                let prompt = `Исправь:\n \`\`\`${text}\`\`\``;
                let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
                let messageData = {
                    text: prompt,
                    chatID: newChatID,
                };
                await OpenAI.request(messageData, OpenAIViewProvider._webviewView.webview, true, true);
                vscode.window.showInformationMessage(`Запрос обработан:${prompt}`);

            } catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(fixCode);
        let finishCode = vscode.commands.registerCommand('vscode-fxpw-ai-chat.finishCode', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Нет активного редактора');
                    return;
                }

                const selection = editor.selection;
                const text = editor.document.getText(selection);

                let prompt = `Допиши код:\n \`\`\`${text}\`\`\``;
                let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
                let messageData = {
                    text: prompt,
                    chatID: newChatID,
                };
                await OpenAI.request(messageData, OpenAIViewProvider._webviewView.webview, true, true);
                vscode.window.showInformationMessage(`Запрос обработан:${prompt}`);

            } catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(finishCode);

        let deleteAllChatsData = vscode.commands.registerCommand('vscode-fxpw-ai-chat.deleteAllChatsData', async () => {
            try {
                await OpenAI.deleteAllChatsData();
            } catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(deleteAllChatsData);
    }
}

export { ExtensionCommands };
