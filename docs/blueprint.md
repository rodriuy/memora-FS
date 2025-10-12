# **App Name**: Memora

## Core Features:

- User Authentication and Family Creation: Allow users to register/login and create family accounts, becoming family admins.
- Story Upload and Transcription: Enable users to upload audio files or record audio, which are then transcribed using OpenAI's Whisper API. Status updates should be displayed in real time. Use the LLM as a tool for generating the transcription.
- Story Editing and Management: Allow users to edit transcriptions, add titles, and assign photos to stories.
- Memora Box Pairing: Enable premium users to link their physical Memora Box by entering a pairing code.  Must search memoraBoxes collection for a document with the pairing code, and associate the familyId of the user.
- Story Donation to 'Estudia Memora': Implement a feature to donate stories to the 'Estudia Memora' community. Anonymize text with OpenAI/Gemini via Firebase Function when the 'donate' toggle is active. Store it separately for 'Estudia Memora'. The LLM should be used as a tool for anonymizing text.
- Subscription Model: Implement a freemium subscription model with limited stories/photos for free users and unlimited access + Memora Box pairing for premium users.
- Animated Photo Generation: Implement an animated photo feature using the D-ID API or similar to bring family photos to life.  This should only be available for premium users.

## Style Guidelines:

- The app evokes natural nostalgia by drawing inspiration from colors of nature, the dominant impression being one of earth tones, which are subtle yet saturated. It employs a dark color scheme with background color: Dark olive (#414F31).
- Primary color: Burnt umber (#A0522D), a rich brown conveying warmth, heritage, and stability.
- Accent color: Forest green (#228B22), which provides a refreshing contrast that evokes nature and growth.
- Headline font: 'Lora', a serif font, offering a touch of elegance and readability, paired with 'Open Sans', a sans-serif font, for body text to maintain clarity and modernity. 
- Use simple, line-based icons that complement the minimalist design. Icons should represent family, memory, and technology.
- Employ a clean, card-based layout for stories and family members. Prioritize white space to create a calming, uncluttered feel.
- Incorporate subtle transitions and animations when navigating between pages or loading content. A gentle fade-in effect can enhance the feeling of nostalgia.