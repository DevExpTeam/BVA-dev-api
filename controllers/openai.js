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
      model: 'gpt-4.1',
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
      model: 'gpt-4.1',
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

const getSearchRate = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });

  const system_message = `
  You are a web search agent for financial data.
  You will be provided a website link. You must visit only that website link to find the data which user needs.
  For any request, you must provide only one number without any other words or alphabets. Don't include "%", either.
  `

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        { role: 'system', content: system_message },
        { role: 'user', content: data }
      ],
      tools: [
        {
          type: 'web_search_preview',
          user_location: {
            type: 'approximate'
          },
          search_context_size: 'low'
        }
      ],
    })

    res.json(response.output_text);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT search result", error: error.message });
  }
};

const getSearchCompany = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });

  const system_message = `
  You are a web search agent for financial data.
  You will be provided a website link for the company and you must visit it to find data.
  You must search the company in www.google.com and Wikipedia to find data.
  Here are website links where you can find SIC, ISIC and NAICS codes and you must visit them to find data.
  https://www.ibisworld.com/
  https://www.naics.com/
  https://www.zoominfo.com/
  https://rocketreach.co/
  https://siccode.com/
  You also must search through the whole Internet to find the exact data which user needs.
  Please ensure that you checked all the website links I provided.
  Please give them the live data from web sources. Don't make assumptions and the data must be 100% accurate.
  You must extract the result as a given structure without any explanation.
  `

  const user_message = `
  This is the website link of our company
  ${data}

  Please give me our company's data.
  `

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        { role: 'system', content: system_message },
        { role: 'user', content: user_message }
      ],
      tools: [
        {
          "type": "function",
          "name": "get_searchData",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "The name of business"
              },
              "address": {
                "type": "string",
                "description": "The business address"
              },
              "city": {
                "type": "string",
                "description": "The city which the business in"
              },
              "state": {
                "type": "string",
                "description": "The state which the business in"
              },
              "zipCode": {
                "type": "string",
                "description": "ZIP code of the business location"
              },
              "country": {
                "type": "string",
                "description": "The country of the business. Don't use abbreviations such as USA or UK."
              },
              "dunsNumber": {
                "type": "string",
                "description": "The DUNS number of the business"
              },
              "pNAICS": {
                "type": "string",
                "description": "The NAICS code of the business's primary activity"
              },
              "pSIC": {
                "type": "string",
                "description": "The SIC code of the business's primary activity"
              },
              "pISIC": {
                "type": "string",
                "description": "The ISIC code of the business's primary activity"
              },
              "sNAICS": {
                "type": "string",
                "description": "The NAICS code of the business's secondary activity"
              },
              "sSIC": {
                "type": "string",
                "description": "The SIC code of the business's secondary activity"
              },
              "sISIC": {
                "type": "string",
                "description": "The ISIC code of the business's secondary activity"
              }
            },
            "additionalProperties": false,
            "required": [
              "name",
              "address",
              "city",
              "state",
              "zipCode",
              "country",
              "dunsNumber",
              "pNAICS",
              "pSIC",
              "pISIC",
              "sNAICS",
              "sSIC",
              "sISIC"
            ]
          },
          "strict": true
        },
        {
          type: 'web_search_preview',
          user_location: {
            type: 'approximate'
          },
          search_context_size: 'high'
        }
      ],
    })

    res.json(response?.output[2].arguments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT search result", error: error.message });
  }
};

const getSearchReport = async (req, res) => {
  const { data } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_KEY,
    // dangerouslyAllowBrowser: true
  });

  const system_message = `
  You are a web search agent specializing in financial and ${data?.type} data collection for business valuation purposes.
  `

  const user_message = `
  Search the web just one time after you carefully read all instructions.

  This is the website link of our company
  ${data?.link}

  Write a comprehensive 500-1,000 word “The ${data?.type}${data?.type === "Business" ? " Overview" : ""} Report” ${data?.type === "Economic" ? "after you find out which country our company is in" : "for our company"}.
  This report will be included in a formal business valuation report.
  ${data?.type === "Business" ? "The report must include contents about products & services and competition." : data?.type === "Economic" ? "The report must include contents about national, regional and local analysis." : ""}
  Strictly adhere to NACVA and USPAP standards.
  Follow the logic, structure, tone, and format of the attached file “${data?.type} Overview Main”${data?.type === "Business" ? "." : " and use the attached file “" + data?.type + " Overview Supplementary” as reference."}
  Check those files first and then carefully search all available online sources to collect enough data.
  Do NOT make assumptions and the data must be 100% accurate.
  Do NOT include the report title, your own explanation or unnecessary words.
  Do NOT include any links, addresses, or source references of any kind.
  Do NOT repeat searches or generate duplicate reports.
  `

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        { role: 'system', content: system_message },
        { role: 'user', content: user_message }
      ],
      tools: [
        {
          "type": "file_search",
          "vector_store_ids": [
            data?.type === "Business" ?
              "vs_6837d5a48a3481918f0b754531e26019"
            :
              data?.type === "Industry" ? "vs_6836e73634588191baeaa7e68314e214" : "vs_68382eb75f2c8191a7e17d9d7570e4ef"
          ]
        },
        {
          type: 'web_search_preview',
          user_location: {
            type: 'approximate'
          },
          search_context_size: 'high'
        }
      ],
    })

    res.json(response?.output_text);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting GPT search result", error: error.message });
  }
};

module.exports = { getCategory, getNote, getSearchRate, getSearchCompany, getSearchReport };
