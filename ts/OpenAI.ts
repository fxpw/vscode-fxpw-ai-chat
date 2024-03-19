import * as vscode from 'vscode';
import {HttpsProxyAgent} from "https-proxy-agent";
import { OpenAI as OpenAILib } from "openai";
import { ExtensionSettings } from "./ExtensionSettings";
import { ExtensionData } from "./ExtensionData";
import { URL } from 'url';
interface MessageData {
    chatID: number;
    text: string;
}

class OpenAI {
    static async request(messageData: MessageData, webview: vscode.Webview|undefined=undefined, needPreUpdate: boolean=false, needPostUpdate: boolean=false): Promise<void> {
        try {
            await ExtensionData.setCurrentChatID(messageData.chatID);
            const conversationSendTextButtonOnClickData = {
                "role": "user",
                "content": messageData.text,
            };

            let agent: HttpsProxyAgent<string> | false = false;
            if (ExtensionSettings.PROXY_URL) {
                agent = new HttpsProxyAgent(ExtensionSettings.PROXY_URL);
            }
            const openai = new OpenAILib({
                apiKey: ExtensionSettings.OPENAI_KEY,
                httpAgent: agent || undefined,
            });
            await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData, messageData.chatID);
            const newChatData = ExtensionData.getChatDataByID(messageData.chatID);
            await ExtensionData.blockChatByID(messageData.chatID);

            // Примерное использование webview и needPreUpdate, needPostUpdate опущено для краткости
            // Заглушка для использования webview, примерная реализация
			if (newChatData && newChatData.conversation){
				const messagesForAPI: OpenAILib.Chat.Completions.ChatCompletionMessageParam[] = newChatData.conversation.map((msg) => ({
					role: msg.role === 'user' ? 'user' : 'assistant',
					content: msg.content,
				}));
				const chatCompletion = await openai.chat.completions.create({
					messages: messagesForAPI,
					model: ExtensionSettings.OPENAI_MODEL!,
				});
				if (chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content) {
					const conversationAIData = {
						"role": "assistant",
						"content": chatCompletion.choices[0].message.content,
					};
					await ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
				}
			}

        } catch (error) {
            const conversationAIData = {
                "role": "assistant",
                "content": error instanceof Error ? error.message : "Unknown error",
            };
            await ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
        } finally {
            await ExtensionData.unblockChatByID(messageData.chatID);
        }
    }
	static getChatsListData(){
		return ExtensionData.chatsData;
	}
	static getCurrentChatData(){
		return ExtensionData.getCurrentChatData();
	}
	static getCurrentChat(){
		return ExtensionData.currentChatID;
	}
	static async deleteChatDataByID(messageData: MessageData){
		try {
			return await ExtensionData.deleteChatDataByID(messageData.chatID);
		} catch (error) {
			console.error(error);
		}
	}
	static async createNewChat(model:string):Promise<number>{
		try {
			return await ExtensionData.createNewChat(model);
		} catch (error) {
			console.error(error);
			return -1;
		}
	}
	static async deleteAllChatsData(){
		try {
			return await ExtensionData.deleteAllChatsData();
		} catch (error) {
			console.error(error);
		}
	}
	static async setCurrentChatID(id:number){
		try {
			return await ExtensionData.setCurrentChatID(id);
		} catch (error) {
			console.error(error);
		}
	}

}

export { OpenAI };
