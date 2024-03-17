
const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const openai_lib = require("openai");
const {ExtensionSettings} = require("./ExtensionSettings.js");
// eslint-disable-next-line no-unused-vars
const {ExtensionData} = require("./ExtensionData.js");
// const {OpenAIViewProvider} = require("./OpenAIViewProvider.js");

class OpenAI{
	// eslint-disable-next-line no-unused-vars
	static async request(messageData,webview,needPreUpdate,needPostUpdate) {
		try {
			// let newChatID = messageData.chatID;
			await ExtensionData.setCurrentChatID(messageData.chatID);
			let conversationSendTextButtonOnClickData = {
				"role":"user",
				"content":messageData.text,
			}
			
			let agent = false;
			if(ExtensionSettings.PROXY_URL){
				agent = new https_proxy_agent.HttpsProxyAgent(ExtensionSettings.PROXY_URL);
			}
			let openai = new openai_lib.OpenAI({
				apiKey : ExtensionSettings.OPENAI_KEY,
				httpAgent:agent ? agent : null,
			});
			await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData,messageData.chatID);
			let newChatData = ExtensionData.getChatDataByID(messageData.chatID);
			await ExtensionData.blockChatByID(messageData.chatID);
			if(webview && needPreUpdate){
				try {
					if (OpenAI.getCurrentChat()==messageData.chatID){
						webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID:messageData.chatID });
						// webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
					}else if(OpenAI.getCurrentChat()==-1) {
						webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
					}
				} catch (error) {
					console.error(error);
				}
			}
			const chatCompletion = await openai.chat.completions.create({
				messages: newChatData.conversation,
				model: ExtensionSettings.OPENAI_MODEL,
			});
			if(chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content){
				let conversationAIData = {
					"role":"assistant",
					"content":chatCompletion.choices[0].message.content,
				}
				await ExtensionData.addDataToChatById(conversationAIData,messageData.chatID);
			}
		} catch (error) {
			let conversationAIData = {
				"role":"assistant",
				"content":error.message,
			}
			await ExtensionData.addDataToChatById(conversationAIData,messageData.chatID);
		} finally{
			await ExtensionData.unblockChatByID(messageData.chatID);
			if (webview && needPostUpdate){
				try {
					if (OpenAI.getCurrentChat()==messageData.chatID){
						webview.postMessage({ command: 'clickToOpenConversationButtonResponse', chatData: OpenAI.getCurrentChatData(), currentChatID:messageData.chatID });
						// webview.postMessage({ command: 'conversationSendTextButtonOnClickResponse', chatData: OpenAI.getCurrentChatData() });
					}else if(OpenAI.getCurrentChat()==-1) {
						webview.postMessage({ command: 'toHomeButtonOnClickResponse', chatsListData : OpenAI.getChatsListData() });
					}
				} catch (error) {
					console.error(error);
				}
			}
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
	static async deleteChatDataByID(messageData){
		try {
			return await ExtensionData.deleteChatDataByID(messageData.chatID);
		} catch (error) {
			console.error(error);
		}
	}
	static async createNewChat(model){
		try {
			return await ExtensionData.createNewChat(model);
		} catch (error) {
			console.error(error);
		}
	}
	static async deleteAllChatsData(){
		try {
			return await ExtensionData.deleteAllChatsData();
		} catch (error) {
			console.error(error);
		}
	}
	static async setCurrentChatID(id){
		try {
			return await ExtensionData.setCurrentChatID(id);
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = {OpenAI}