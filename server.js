const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, organization: 'org-xUjRSuXI3AOAmlpDWMXJEuew' });
app.use(cors());
app.use(express.json()); 
const openai = new OpenAIApi(configuration);
const data = require('./data/help_articles.js')

async function generateChatCompletion(role, content, model='gpt-4', temperature=0.1) {
  const res = await openai.createChatCompletion({
    model,
    messages: [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": role, "content": content}
    ],
    temperature
  });

  return res.data.choices[0].message.content;
}

app.post('/getResponse', async (req, res) => {
  console.log(req.body)  
  const question = req.body.question;  
  let category;

  try {
    const issueCategoryContent = `We provide a Software for Gas Engineers. It has a mobile and a web app version. If you could put the following question from a customer in a category, what category would it be? Question: '${question}', Categories available:'WebApp', 'MobileApp','Costs'. Give me just the category name, nothing else.`;
    category = await generateChatCompletion("user", issueCategoryContent);

    console.log("Category is ", category)

    if(category === 'Costs' || category === 'WebApp' || category === 'MobileApp'){
      const responseContent = `You have the following information: ${data[category]}. Can you answer the following question? Also, please format your answer in a readable way, adding necessary line breaks ('backwardslash n') where needed. Those line breaks but be added in your response string, so when the response pulled to front end the linebreaks are added to the text. Question: '${question}'`;
      const response = await generateChatCompletion("user", responseContent);

      console.log(response)
      res.send(response);
    }
    else {
      res.send(`Category ${category} not supported yet.`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
