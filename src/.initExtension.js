
const {ExtensionData} = require("./ExtensionData.js");
const {ExtensionSettings} = require("./ExtensionSettings.js");
const {ExtensionCommands} = require("./ExtensionCommands.js");

const {OpenAIViewProvider} = require("./OpenAIViewProvider.js");


function activate(context) {
	try {
		ExtensionData.Init(context);
		ExtensionSettings.Init(context);
		ExtensionCommands.Init(context);
		OpenAIViewProvider.Init(context);
		console.log("vscode-fxpw-ai-chat loaded");
	} catch (error) {
		console.error(91,error);
	}
}



exports.activate = activate;
