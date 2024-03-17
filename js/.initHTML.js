let vscode;
let IN_CHAT;
let CURRENT_CHAT_ID;
let IS_CHAT_BLOCKED;
try {
	vscode = acquireVsCodeApi();
	IN_CHAT = false;
	CURRENT_CHAT_ID = -1;
	IS_CHAT_BLOCKED=false;
} catch (error) {
	console.error(error);
}
