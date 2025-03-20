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
        let generateCommit = vscode.commands.registerCommand('vscode-fxpw-ai-chat.generateCommit', async () => {
            try {
                const gitExtension = vscode.extensions.getExtension('vscode.git');
                if (gitExtension?.exports) {
                    const api = gitExtension.exports.getAPI(1);
                    if (api?.repositories.length > 0) {
                        // get git changes for request
                        let changes = await api.repositories[0].diff();
                        let diffMessage = `create git commit message whit that diff where @@@start of diff@@@@ = start diff message and @@@end of diff@@@ = end of diff message, look at each file and write changes via ->\\n- change 1\\n- change 2<- , carefull look of diff, its may contain spaces, give me answer in json in that example {"answer":"@your_answer@"}:@@@start of diff@@@@${changes}@@@end of diff`;
                        let answerJSON = await OpenAI_1.OpenAI.commitRequest(diffMessage);
                        if (answerJSON == null) {
                            api.repositories[0].inputBox.value = "cant get answer from openai";
                            return;
                        }
                        const jsonRegex = /```json\s*(.+?)\s*```/;
                        const match = answerJSON.match(jsonRegex);
                        if (match && match[1]) {
                            const jsonString = match[1];
                            try {
                                const responseObject = JSON.parse(jsonString);
                                const answer = responseObject.answer;
                                api.repositories[0].inputBox.value = answer;
                                return;
                            }
                            catch (error) {
                                api.repositories[0].inputBox.value = answerJSON;
                            }
                        }
                        api.repositories[0].inputBox.value = answerJSON;
                        // const responseObject = JSON.parse(answerJSON);
                        // api.repositories[0].inputBox.value = responseObject.answer?responseObject.answer:answerJSON;
                    }
                    else {
                        console.error('No repositories found in the Git extension.');
                    }
                }
                else {
                    console.error('Git extension not available or not loaded.');
                }
            }
            catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(generateCommit);
        let explainCode = vscode.commands.registerCommand('vscode-fxpw-ai-chat.explainCode', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Нет активного редактора');
                    return;
                }
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                let prompt = `Объясни:\n\n\`\`\`${text}\n\`\`\``;
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
                let prompt = `Исправь:\n\n\`\`\`${text}\n\`\`\``;
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
                let prompt = `Допиши код:\n\n\`\`\`${text}\n\`\`\``;
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
        context.subscriptions.push(finishCode);
        let deleteAllChatsData = vscode.commands.registerCommand('vscode-fxpw-ai-chat.deleteAllChatsData', async () => {
            try {
                await OpenAI_1.OpenAI.deleteAllChatsData();
            }
            catch (error) {
                console.error(error);
            }
        });
        context.subscriptions.push(deleteAllChatsData);
        // let test = vscode.commands.registerCommand('vscode-fxpw-ai-chat.test', async () => {
        // 	try {
        // 		await OpenAI.deleteAllChatsData();
        // 	} catch (error) {
        // 		console.error(error);
        // 	}
        // });
        // context.subscriptions.push(test);
    }
}
exports.ExtensionCommands = ExtensionCommands;
//# sourceMappingURL=ExtensionCommands.js.map