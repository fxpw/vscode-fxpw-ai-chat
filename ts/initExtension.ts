import { ExtensionContext } from 'vscode';
import { ExtensionData } from './ExtensionData';
import { ExtensionSettings } from './ExtensionSettings';
import { ExtensionCommands } from './ExtensionCommands';
import { OpenAIViewProvider } from './OpenAIViewProvider';

export function activate(context: ExtensionContext): void {
    try {
        ExtensionData.Init(context);
        ExtensionSettings.Init(context);
        ExtensionCommands.Init(context);
        OpenAIViewProvider.Init(context);
		const version = context.extension.packageJSON.version;
		console.log(`vscode-fxpw-ai-chat version: ${version}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(91, error.message);
        } else {
            console.error(91, 'An unknown error occurred');
        }
    }
}
