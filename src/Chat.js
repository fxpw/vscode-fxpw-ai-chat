
const https_proxy_agent = require("https-proxy-agent");
// const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const openai_lib = require("openai");
const {ExtensionSettings} = require("./ExtensionSettings.js");
const {ExtensionData} = require("./ExtensionData.js");

class Chat{
	// eslint-disable-next-line no-unused-vars
	static async queryOpenAI(query, chatID = null) {
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
			model: ExtensionSettings.config.get('openAIModel'),
		});
		console.log(chatCompletion);
		return chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content;
	
	}
}

module.exports = {Chat}