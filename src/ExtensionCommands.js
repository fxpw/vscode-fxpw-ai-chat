const vscode = require("vscode");
const {OpenAI} = require("./OpenAI.js");
const {OpenAIViewProvider} = require("./OpenAIViewProvider.js");
const {ExtensionSettings} = require("./ExtensionSettings.js");

class ExtensionCommands{
	static Init(context) {
		let openSettingsCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.openSettings', function () {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vscode-fxpw-ai-chat').then(() => {
				// console.log('vscode-fxpw-ai-chat config open');
			}, (err) => {
				vscode.window.showErrorMessage('error: ' + err);
			});
		});
		context.subscriptions.push(openSettingsCommand);

		let WTFCodeNewChatCommand = vscode.commands.registerCommand('vscode-fxpw-ai-chat.WTFCodeNewChat',async function () {
			try {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					vscode.window.showInformationMessage('Нет активного редактора');
					return;
				}

				const selection = editor.selection;
				const text = editor.document.getText(selection);

				let promt = `Объясни: ${text}`
				let newChatID = await OpenAI.createNewChat(ExtensionSettings.OPENAI_MODEL);
				let messageData = {
					text: promt,
					chatID : newChatID,
				}
				await OpenAI.request(messageData,OpenAIViewProvider._webviewView.webview,true,true);
				vscode.window.showInformationMessage(`Запрос обработан:${promt}`);

			} catch (error) {
				console.error(error);
			}
			
		});
		context.subscriptions.push(WTFCodeNewChatCommand);
	};
}

module.exports = { ExtensionCommands }