// Set your OpenAI API key
const apiKey = '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';


async function chatWithGPT(prompt) {
  try {
    // Send the prompt to ChatGPT
    const response = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-002/completions',
      {
        prompt: prompt,
        max_tokens: 450, // You can adjust the number of tokens based on your needs
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    // Display the ChatGPT response
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error while communicating with GPT:', error);
    return '';
  }
}

// Get the cosine-similarity of two vectors
function cosineSimilarity(vec1, vec2) {
  let dotProd = 0;
  for (let i = 0; i < vec1.length; i++) {
    dotProd += parseFloat(vec1[i]) * parseFloat(vec2[i]);
  }

  // Now get magnitudes
  let vec1Mag = 0;
  let vec2Mag = 0;
  for (let i = 0; i < vec1.length; i++) {
    vec1Mag += vec1[i] ** 2;
    vec2Mag += vec2[i] ** 2;
  }
  vec1Mag = Math.sqrt(vec1Mag);
  vec2Mag = Math.sqrt(vec2Mag);

  // Now divide dot product by the product of the magnitudes
  return dotProd / (vec1Mag * vec2Mag);
}

// Clean up the GPT response and put it into a list
function trimResponse(resp) {
  const responseList = resp.split(',');
  for (let i = 0; i < responseList.length; i++) {
    responseList[i] = parseFloat(responseList[i].trim());  // Strip away whitespace, convert to float
  }

  return responseList;
}

async function search_engine_gpt(userInput) {
    // Add some explanation for AI on how to handle the query
  const padding =
    'We have a query from a user searching for a shirt. Based on the query assign 4 values from 1 to 5. The first value represents color intensity of the shirt, with (1=low intensity, 5=high). The second value is sleeve length (1=short, 5=long). The third value is neckline boldness (1=standard crew-neck, 5=unique/bold necklines like over-the-shoulder). The fourth value is material texture (1=smooth, 5=textured). Return the values separated by commas, with no spaces. Do not return any text at all. Only return the comma-separated values. Here is the query:';

  // Send the query to GPT and get back a vector with the latent factors
  const queryVector = trimResponse(await chatWithGPT(padding + userInput));    // UNCOMMENT THIS IN THE FINAL!!!!

  // Read CSV file containing our shirt inventory into 'shirtsList'
  const shirtsList = [
    {
      Title: "Lil Tjay Shirt",
      Color_Intensity: "3",
      Sleeve_Length: "3",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
    {
      Title: "Green Workout Shirt",
      Color_Intensity: "4",
      Sleeve_Length: "3",
      Neckline_Boldness: "3",
      Material_Texture: "3",
    },
    {
      Title: "Gray Workout Shirt",
      Color_Intensity: "3",
      Sleeve_Length: "3",
      Neckline_Boldness: "3",
      Material_Texture: "3",
    },
    {
      Title: "Red Fullsleeves",
      Color_Intensity: "4",
      Sleeve_Length: "5",
      Neckline_Boldness: "3",
      Material_Texture: "2",
    },
    {
      Title: "Grey Tshirt",
      Color_Intensity: "3",
      Sleeve_Length: "2",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
    {
      Title: "Yellow Fullsleeves",
      Color_Intensity: "4",
      Sleeve_Length: "5",
      Neckline_Boldness: "3",
      Material_Texture: "2",
    },
    {
      Title: "Blue Choir Shirt",
      Color_Intensity: "3",
      Sleeve_Length: "3",
      Neckline_Boldness: "4",
      Material_Texture: "2",
    },
    {
      Title: "Tan Tshirt",
      Color_Intensity: "3",
      Sleeve_Length: "2",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
    {
      Title: "Blue Tshirt",
      Color_Intensity: "3",
      Sleeve_Length: "2",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
    {
      Title: "Purple Polo",
      Color_Intensity: "4",
      Sleeve_Length: "3",
      Neckline_Boldness: "3",
      Material_Texture: "2",
    },
    {
      Title: "Navy Tshirt",
      Color_Intensity: "3",
      Sleeve_Length: "2",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
    {
      Title: "Hawaiian Shirt",
      Color_Intensity: "5",
      Sleeve_Length: "3",
      Neckline_Boldness: "4",
      Material_Texture: "4",
    },
    {
      Title: "Teal Tshirt",
      Color_Intensity: "3",
      Sleeve_Length: "2",
      Neckline_Boldness: "2",
      Material_Texture: "2",
    },
  ]

      // Create dictionary with each of our shirts, and their cosine similarity to the query
      const shirtSimilarities = {};
      for (let i = 0; i < shirtsList.length; i++) {
        // First, let's get the four values for shirtsList[i] into a new list
        const shirtValues = [
          parseFloat(shirtsList[i].Color_Intensity),
          parseFloat(shirtsList[i].Sleeve_Length),
          parseFloat(shirtsList[i].Neckline_Boldness),
          parseFloat(shirtsList[i].Material_Texture),
        ];
        // Now 'shirtValues' is formatted properly for our cosine-similarity function
        const queryShirtSimilarity = cosineSimilarity(queryVector, shirtValues);
        // Now append this similarity value to our dictionary
        shirtSimilarities[shirtsList[i].Title] = queryShirtSimilarity;
      }

      // Now sort the dictionary by similarity
      const sortedSimilarities = Object.fromEntries(
        Object.entries(shirtSimilarities).sort(([, a], [, b]) => b - a)
      );

      // Return the top-3 most similar results
      let count = 0;
      let results_list = [];
        for (const key in sortedSimilarities) {
          results_list.push(key);
          count++;
          if (count === 3) {
            break;
          }
        }
      return results_list;
}

