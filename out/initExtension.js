"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const ExtensionData_1 = require("./ExtensionData");
const ExtensionSettings_1 = require("./ExtensionSettings");
const ExtensionCommands_1 = require("./ExtensionCommands");
const OpenAIViewProvider_1 = require("./OpenAIViewProvider");
function activate(context) {
    try {
        ExtensionData_1.ExtensionData.Init(context);
        ExtensionSettings_1.ExtensionSettings.Init(context);
        ExtensionCommands_1.ExtensionCommands.Init(context);
        OpenAIViewProvider_1.OpenAIViewProvider.Init(context);
        console.log('vscode-fxpw-ai-chat loaded 1.1.223412');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(91, error.message);
        }
        else {
            console.error(91, 'An unknown error occurred');
        }
    }
}
//# sourceMappingURL=initExtension.js.map