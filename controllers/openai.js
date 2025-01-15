const OpenAI = require('openai');

const getCategory = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });
  
  const system_message = `
  You are an expert in accounting.
  Please provide accurate and direct answers to questions about choosing categories.
  For any request, you must provide one word without punctuation marks and the answer must be exactly the same as one of given categories.
  Make sure that your final answer is complete and accurate.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: system_message },
        { role: 'user', content: data }
      ],
      temperature: 0,
    })

    res.json(response.choices[0].message.content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT categories", error: error.message });
  }
};

const getNote = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });

  const system_message = `
  You are an expert in corporate finance and accounting.
  Please provide accurate and meaningful answers to questions about creating analyst notes.
  You will receive the company's basic data and perform the requested analysis based on it.
  I don't need detailed calculations but just analysis them in short sentences.
  Don't include negative or uncertain sentences which say something will be needed for more detailed analysis.
  Don't include uncertain words such as "may", "might" and "could".
  Don't include a sentence which means the result is based on the provided data.
  Don't list them with numbers or bullets and don't contain a title and blank lines.
  Make sure that your final answer is complete and accurate.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system_message },
        { role: 'user', content: data }
      ],
    })

    res.json(response.choices[0].message.content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT notes", error: error.message });
  }
};

const getSearchResult = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });

  const system_message = `
  You are a search agent for financial data.
  You must visit the links below to find the data which user needs.
  https://ycharts.com/indicators/10_year_treasury_rate
  Please give them the live data from the source.
  Don't say to visit links.
  For any request, you must provide only one number without any other words or alphabets.
  If you can't provide the live data, just say "NaN".
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system_message },
        { role: 'user', content: data }
      ],
    })

    res.json(response.choices[0].message.content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT search result", error: error.message });
  }
};

module.exports = { getCategory, getNote, getSearchResult };
