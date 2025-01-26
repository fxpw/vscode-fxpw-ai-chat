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
        console.log('vscode-fxpw-ai-chat loaded 1.1.223412');
    } catch (error) {
        if (error instanceof Error) {
            console.error(91, error.message);
        } else {
            console.error(91, 'An unknown error occurred');
        }
    }
}
