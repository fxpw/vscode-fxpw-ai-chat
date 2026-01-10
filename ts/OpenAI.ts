import * as vscode from 'vscode';
// import * as url from 'url';

// Conditionally import modules that don't work in browser
let HttpsProxyAgent: any = null;
let SocksProxyAgent: any = null;
let OpenAILib: any = null;

try {
	// These modules are not available in browser environment
	const httpsProxyModule = require("https-proxy-agent");
	const socksProxyModule = require('socks-proxy-agent');
	const openaiModule = require("openai");

	HttpsProxyAgent = httpsProxyModule.HttpsProxyAgent || httpsProxyModule.default;
	SocksProxyAgent = socksProxyModule.SocksProxyAgent || socksProxyModule.default;
	OpenAILib = openaiModule.OpenAI || openaiModule.default;
} catch (e) {
	// In browser environment, we'll use stubs or skip functionality
	console.log('Running in browser environment, some modules not available');
}

import { ExtensionSettings } from "./ExtensionSettings";

// Conditionally import ExtensionData
let ExtensionData: any = null;
let ModelConfig: any = null;

try {
	const extData = require('./ExtensionData');
	ExtensionData = extData.ExtensionData;
	ModelConfig = extData.ModelConfig;
} catch (e) {
	console.log('ExtensionData not available in browser environment');
}
interface MessageData {
	chatID: number;
	text: string;
	messageId?: string;
}

class OpenAI {
	static async request(messageData: MessageData, webview: vscode.Webview | undefined = undefined, needPreUpdate: boolean = false, needPostUpdate: boolean = false): Promise<boolean> {
		try {
			// Check if we're in browser environment where ExtensionData is not available
			if (!ExtensionData) {
				console.log('Browser environment: skipping API call');
				return false;
			}

			await ExtensionData.setCurrentChatID(messageData.chatID);
			const conversationSendTextButtonOnClickData = {
				"role": "user",
				"content": messageData.text,
				"id": messageData.messageId,
			};

			// Get chat data and model configuration
			const chatData = ExtensionData.getChatDataByID(messageData.chatID);
			if (!chatData) {
				throw new Error('Chat data not found');
			}

			const modelConfig = ExtensionData.getModelById(chatData.modelId);
			if (!modelConfig) {
				throw new Error('Model configuration not found');
			}

			let agent: any = undefined;
			if (modelConfig.useProxy) {
				try {
					let proxyUrl: string;
					if (!modelConfig.useSOCKS5) {
						if (modelConfig.proxyLogin && modelConfig.proxyPassword && modelConfig.proxyIP && modelConfig.proxyPortHttps) {
							proxyUrl = `http://${modelConfig.proxyLogin}:${modelConfig.proxyPassword}@${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
						} else if (modelConfig.proxyIP && modelConfig.proxyPortHttps) {
							proxyUrl = `http://${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
						} else {
							throw new Error('Invalid proxy configuration');
						}
					} else {
						proxyUrl = `socks5h://${modelConfig.proxyLogin}:${modelConfig.proxyPassword}@${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
					}

					const parsedProxyUrl = new URL(proxyUrl);

					if (!modelConfig.useSOCKS5) {
						const agentOptions = {
							rejectUnauthorized: false,
							timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : 30000
						};
						agent = new HttpsProxyAgent(parsedProxyUrl, agentOptions);
					} else {
						agent = new SocksProxyAgent(parsedProxyUrl);
					}
				} catch (error) {
					console.error('Proxy URL parsing error:', error);
				}
			} else {
				// Try to use system proxy as fallback
				const systemProxy = process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy;
				if (systemProxy) {
					try {
						const agentOptions = {
							rejectUnauthorized: false,
							timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : 30000
						};
						agent = new HttpsProxyAgent(systemProxy, agentOptions);
					} catch (error) {
						console.error('System proxy error:', error);
					}
				}
			}

			let finalBaseurl: string | null = modelConfig.baseUrl || null;

			// Auto-detect base URL if not provided
			if (!finalBaseurl) {
				if (modelConfig.modelName === "deepseek-chat") {
					finalBaseurl = "https://api.deepseek.com";
				} else if (modelConfig.modelName === "alibaba/tongyi-deepresearch-30b-a3b") {
					finalBaseurl = "https://openrouter.ai/api/v1";
				} else if (modelConfig.modelName === "llama3.1:8b" || modelConfig.modelName === "llama3.1:8b-instruct-q5_K_M") {
					finalBaseurl = "http://localhost:11434/v1";
				}
			}

			const openai = new OpenAILib({
				baseURL: finalBaseurl,
				apiKey: modelConfig.apiKey || "ollama",
				httpAgent: agent || undefined,
			});

			await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData, messageData.chatID);
			const newChatData = ExtensionData.getChatDataByID(messageData.chatID);
			await ExtensionData.blockChatByID(messageData.chatID);

			if (newChatData && newChatData.conversation) {
				const messagesForAPI: any[] = newChatData.conversation.map((msg: any) => ({
					role: msg.role === 'user' ? 'user' : 'assistant',
					content: msg.content,
				}));

				if (modelConfig.streaming) {
					// Streaming mode
					let fullContent = '';
					const stream = await openai.chat.completions.create({
						messages: messagesForAPI,
						model: modelConfig.modelName,
						stream: true,
					}, {
						httpAgent: agent || undefined,
						timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : undefined,
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

						// Send completion message to finalize streaming
						if (webview) {
							webview.postMessage({
								command: 'streamingComplete',
								chatID: messageData.chatID,
								chatData: ExtensionData.getChatDataByID(messageData.chatID)
							});
						}
					}
					return true; // Streaming was used
				} else {
					// Non-streaming mode
					const chatCompletion = await openai.chat.completions.create({
						messages: messagesForAPI,
						model: modelConfig.modelName,
					}, {
						httpAgent: agent || undefined,
						timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : undefined,
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
			console.error(error);
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
				let agent: any = undefined;
		if (ExtensionSettings.USE_PROXY && ExtensionSettings.PROXY_URL !== "") {
			try {
				const proxyUrl = new URL(ExtensionSettings.PROXY_URL);

				if (!ExtensionSettings.USE_SOCKS5) {
					const agentOptions = {
						rejectUnauthorized: false,
						timeout: ExtensionSettings.TIMEOUT ? ExtensionSettings.TIMEOUT * 1000 : 30000
					};
					agent = new HttpsProxyAgent(proxyUrl, agentOptions);
				} else if (ExtensionSettings.USE_SOCKS5) {
					agent = new SocksProxyAgent(proxyUrl);
				}
			} catch (error) {
				console.error('Commit request proxy error:', error);
			}
		}
		const messageForAPI = {
			role: 'user',
			content: diffMessage,
		};
		const messagesForAPI: any[] = [messageForAPI].map((msg) => ({
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
		if (!ExtensionData) return [];
		return ExtensionData.chatsData;
	}
	static getCurrentChatData() {
		if (!ExtensionData) return null;
		return ExtensionData.getCurrentChatData();
	}
	static getCurrentChat() {
		if (!ExtensionData) return -1;
		return ExtensionData.currentChatID;
	}
	static async deleteChatDataByID(chatID: number | MessageData) {
		try {
			const id = typeof chatID === 'number' ? chatID : chatID.chatID;
			return await ExtensionData.deleteChatDataByID(id);
		} catch (error) {
			console.error(error);
		}
	}
	static async createNewChat(modelId: string): Promise<number> {
		try {
			return await ExtensionData.createNewChat(modelId);
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
	static async deleteMessageFromChat(chatID: number, messageId: string): Promise<boolean> {
		try {
			return await ExtensionData.deleteMessageFromChat(chatID, messageId);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	static async setCurrentChatID(id: number) {
		try {
			return await ExtensionData.setCurrentChatID(id);
		} catch (error) {
			console.error(error);
		}
	}

	// Model management methods
	static async createModel(modelConfig: Omit<any, 'id' | 'createAt' | 'lastUpdate'>): Promise<any> {
		return await ExtensionData.createModel(modelConfig);
	}

	static getModelById(modelId: string): any {
		return ExtensionData.getModelById(modelId);
	}

	static getAllModels(): any[] {
		return ExtensionData.getAllModels();
	}

	static async updateModel(modelId: string, updates: Partial<any>): Promise<any | null> {
		return await ExtensionData.updateModel(modelId, updates);
	}

	static async deleteModel(modelId: string): Promise<boolean> {
		return await ExtensionData.deleteModel(modelId);
	}

}


export { OpenAI };