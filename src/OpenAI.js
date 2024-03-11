
const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const openai_lib = require("openai");
const {ExtensionSettings} = require("./ExtensionSettings.js");
// eslint-disable-next-line no-unused-vars
const {ExtensionData} = require("./ExtensionData.js");

class OpenAI{
	// eslint-disable-next-line no-unused-vars
	static async request(query) {
		let agent = false;
		if(ExtensionSettings.PROXY_URL){
			agent = new https_proxy_agent.HttpsProxyAgent(ExtensionSettings.PROXY_URL);
		}
		let openai = new openai_lib.OpenAI({
			apiKey : ExtensionSettings.OPENAI_KEY,
			httpAgent:agent ? agent : null,
		});
		const chatCompletion = await openai.chat.completions.create({
			messages: [{ role: 'user', content: query }],
			model: ExtensionSettings.OPENAI_MODEL,
		});
		console.log(chatCompletion);
		return chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content;
	
	}

	static async getCurrentChatData(){
		return await ExtensionData.cetCurrentChatData();
	}
	static async getChatsListData(){
		return ExtensionData.chatsData;
	}
	static async getConversationDataForView(){

	}
	static async getConversationDataForRequest(){

	}
	static async createNewChat(){
		return await ExtensionData.createNewChat();
	}
}

module.exports = {OpenAI}