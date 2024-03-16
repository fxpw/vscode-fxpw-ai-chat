
const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const openai_lib = require("openai");
const {ExtensionSettings} = require("./ExtensionSettings.js");
// eslint-disable-next-line no-unused-vars
const {ExtensionData} = require("./ExtensionData.js");

class OpenAI{
	// eslint-disable-next-line no-unused-vars
	static async request(messageData) {
		let newChatID = messageData.chatID;
		await ExtensionData.setCurrentChatID(newChatID);
		let conversationSendTextButtonOnClickData = {
			"role":"user",
			"content":messageData.text,
		}
		await ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData,newChatID);
		
		let agent = false;
		if(ExtensionSettings.PROXY_URL){
			agent = new https_proxy_agent.HttpsProxyAgent(ExtensionSettings.PROXY_URL);
		}
		let openai = new openai_lib.OpenAI({
			apiKey : ExtensionSettings.OPENAI_KEY,
			httpAgent:agent ? agent : null,
		});
		let newChatData = await ExtensionData.getChatDataByID(newChatID);
		try {
			const chatCompletion = await openai.chat.completions.create({
				messages: newChatData.conversation,
				model: ExtensionSettings.OPENAI_MODEL,
			});
			if(chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content){
				let conversationAIData = {
					"role":"assistant",
					"content":chatCompletion.choices[0].message.content,
				}
				await ExtensionData.addDataToChatById(conversationAIData,newChatID);
			}
		} catch (error) {
			let conversationAIData = {
				"role":"assistant",
				"content":error,
			}
			await ExtensionData.addDataToChatById(conversationAIData,newChatID);
		}
	}

	static async getChatsListData(){
		return ExtensionData.chatsData;
	}
	static async getCurrentChatData(){
		return await ExtensionData.getCurrentChatData();
	}
	static async deleteChatDataByID(messageData){
		return await ExtensionData.deleteChatDataByID(messageData.chatID);
	}
	static async createNewChat(model){
		return await ExtensionData.createNewChat(model);
	}
	static async setCurrentChatID(id){
		return await ExtensionData.setCurrentChatID(id);
	}
	static getCurrentChat(){
		return ExtensionData.currentChatID;
	}
}

module.exports = {OpenAI}