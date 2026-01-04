import * as vscode from 'vscode';
// import * as url from 'url';
import { HttpsProxyAgent } from "https-proxy-agent";
import { OpenAI as OpenAILib } from "openai";
import { ExtensionSettings } from "./ExtensionSettings";
import { ExtensionData } from "./ExtensionData";
import { SocksProxyAgent } from 'socks-proxy-agent';
interface MessageData {
	chatID: number;
	text: string;
}

class OpenAI {
	static async request(messageData: MessageData, webview: vscode.Webview | undefined = undefined, needPreUpdate: boolean = false, needPostUpdate: boolean = false): Promise<boolean> {
		try {
			await ExtensionData.setCurrentChatID(messageData.chatID);
			const conversationSendTextButtonOnClickData = {
				"role": "user",
				"content": messageData.text,
			};
			let agent: HttpsProxyAgent<string> | SocksProxyAgent | undefined = undefined;
			if (ExtensionSettings.PROXY_URL !== "") {
				let proxyUrl = new URL(ExtensionSettings.PROXY_URL);
				if (!ExtensionSettings.USE_SOCKS5) {
					agent = new HttpsProxyAgent(proxyUrl);
				} else if (ExtensionSettings.USE_SOCKS5) {
					agent = new SocksProxyAgent(proxyUrl);
				}
			}
			let finalBaseurl: string | null = ExtensionSettings.BASE_URL || null;
			if (!finalBaseurl) {
				if (ExtensionSettings.OPENAI_MODEL == "deepseek-chat"){
					finalBaseurl = "https://api.deepseek.com";
				}else if(ExtensionSettings.OPENAI_MODEL == "alibaba/tongyi-deepresearch-30b-a3b"){
					finalBaseurl = "https://openrouter.ai/api/v1";
				}else if(ExtensionSettings.OPENAI_MODEL == "llama3.1:8b"){
					finalBaseurl = "http://localhost:11434/v1";
				}
			}
			const openai = new OpenAILib({
				baseURL: finalBaseurl,
				apiKey: ExtensionSettings.OPENAI_KEY,
				httpAgent: agent || undefined,
			});
			await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData, messageData.chatID);
			const newChatData = ExtensionData.getChatDataByID(messageData.chatID);
			await ExtensionData.blockChatByID(messageData.chatID);
			if (newChatData && newChatData.conversation) {
				const messagesForAPI: OpenAILib.Chat.Completions.ChatCompletionMessageParam[] = newChatData.conversation.map((msg) => ({
					role: msg.role === 'user' ? 'user' : 'assistant',
					content: msg.content,
				}));
				if (ExtensionSettings.STREAMING) {
					// Streaming mode
					let fullContent = '';
					const stream = await openai.chat.completions.create({
						messages: messagesForAPI,
						model: ExtensionSettings.OPENAI_MODEL,
						stream: true,
					}, {
						httpAgent: agent || undefined,
						timeout: ExtensionSettings.TIMEOUT?ExtensionSettings.TIMEOUT*1000:undefined,
					});

					for await (const chunk of stream) {
						const content = chunk.choices[0]?.delta?.content || '';
						if (content) {
							fullContent += content;
							// Send streaming update to webview
							if (webview) {
								webview.postMessage({
									command: 'streamingMessageUpdate',
									chatID: messageData.chatID,
									content: fullContent
								});
							}
						}
					}

					if (fullContent) {
						const conversationAIData = {
							"role": "assistant",
							"content": fullContent,
						};
						await ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
					}
					return true; // Streaming was used
				} else {
					// Non-streaming mode (existing logic)
					const chatCompletion = await openai.chat.completions.create({
						messages: messagesForAPI,
						model: ExtensionSettings.OPENAI_MODEL,
					}, {
						httpAgent: agent || undefined,
						timeout: ExtensionSettings.TIMEOUT?ExtensionSettings.TIMEOUT*1000:undefined,
					});
					if (chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content) {
						const conversationAIData = {
							"role": "assistant",
							"content": chatCompletion.choices[0].message.content,
						};
						await ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
					}
					return false; // Non-streaming mode
				}
			}
		} catch (error) {
			console.log(error);
			const conversationAIData = {
				"role": "assistant",
				"content": error instanceof Error ? error.message : "Unknown error",
			};
			await ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
			return false; // Error occurred, treat as non-streaming
		} finally {
			await ExtensionData.unblockChatByID(messageData.chatID);
		}
		return false; // Fallback return
	}
	static async commitRequest(diffMessage: string): Promise<string | null> {
		let agent: HttpsProxyAgent<string> | SocksProxyAgent | false = false;
		if (ExtensionSettings.USE_PROXY) {
			if (ExtensionSettings.PROXY_URL !== "") {
				if (!ExtensionSettings.USE_SOCKS5) {
					const proxyUrl = new URL(ExtensionSettings.PROXY_URL);
					agent = new HttpsProxyAgent(proxyUrl);
				} else if (ExtensionSettings.USE_SOCKS5) {
					const proxyUrl = new URL(ExtensionSettings.PROXY_URL);
					agent = new SocksProxyAgent(proxyUrl);
				}
			}
		}
		const messageForAPI = {
			role: 'user',
			content: diffMessage,
		};
		const messagesForAPI: OpenAILib.Chat.Completions.ChatCompletionMessageParam[] = [messageForAPI].map((msg) => ({
			role: msg.role === 'user' ? 'user' : 'assistant',
			content: msg.content,
		}));
		const openai = new OpenAILib({
			apiKey: ExtensionSettings.OPENAI_KEY,
			httpAgent: agent || undefined,
		});
		const chatCompletion = await openai.chat.completions.create({
			messages: messagesForAPI,
			model: ExtensionSettings.OPENAI_MODEL!,
		});
		return chatCompletion.choices && chatCompletion.choices.length > 0
			&& chatCompletion.choices[0].message.content ? chatCompletion.choices[0].message.content
			: null;
	}
	static getChatsListData() {
		return ExtensionData.chatsData;
	}
	static getCurrentChatData() {
		return ExtensionData.getCurrentChatData();
	}
	static getCurrentChat() {
		return ExtensionData.currentChatID;
	}
	static async deleteChatDataByID(messageData: MessageData) {
		try {
			return await ExtensionData.deleteChatDataByID(messageData.chatID);
		} catch (error) {
			console.error(error);
		}
	}
	static async createNewChat(model: string): Promise<number> {
		try {
			return await ExtensionData.createNewChat(model);
		} catch (error) {
			console.error(error);
			return -1;
		}
	}
	static async deleteAllChatsData() {
		try {
			return await ExtensionData.deleteAllChatsData();
		} catch (error) {
			console.error(error);
		}
	}
	static async changeInputText(text: string, chatID: number) {
		await ExtensionData.changeInputText(text, chatID);
	}
	static async setCurrentChatID(id: number) {
		try {
			return await ExtensionData.setCurrentChatID(id);
		} catch (error) {
			console.error(error);
		}
	}

}

export { OpenAI };