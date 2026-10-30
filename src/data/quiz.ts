/**
 * PM Judgment Score question bank.
 *
 * Every fact below was checked against the cited source (English Wikipedia,
 * fetched 2026-10-30). `quote` is the supporting sentence from that source.
 * Rule: if a fact cannot be verified against a reliable source, it does not
 * go in this file.
 */
export interface QuizQuestion {
  id: string
  prompt: string
  /** options[0] is ALWAYS the correct answer; the UI shuffles display order. */
  options: [string, string]
  explanation: string
  lesson: string
  source: { title: string; url: string; quote: string }
}

const wiki = (page: string) => `https://en.wikipedia.org/wiki/${page}`

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'slack-origin',
    prompt: 'Slack started life as an internal tool at a company that was building…',
    options: ['An online video game', 'An enterprise CRM'],
    explanation: 'Tiny Speck built chat tooling while developing the game Glitch. When Glitch failed, the team turned the internal tool into Slack.',
    lesson: 'Sometimes the side-artifact is the product.',
    source: {
      title: 'Slack (software), Wikipedia',
      url: wiki('Slack_(software)'),
      quote: "Slack originated as an internal communication tool used within Stewart Butterfield's company Tiny Speck, during its work on the development of Glitch, an online video game.",
    },
  },
  {
    id: 'youtube-dating',
    prompt: "According to its founders, YouTube's original idea was…",
    options: ['A video version of an online dating service', 'A marketplace for paid video tutorials'],
    explanation: 'Hurley and Chen said the first idea was video dating. Too few dating videos arrived, so they opened the site to every type of video.',
    lesson: 'Users tell you what the product is.',
    source: {
      title: 'YouTube, Wikipedia',
      url: wiki('YouTube'),
      quote: 'Hurley and Chen said that the original idea for YouTube was a video version of an online dating service…',
    },
  },
  {
    id: 'instagram-burbn',
    prompt: 'Before it was Instagram, the app was called Burbn and was…',
    options: ['A mobile check-in app', 'A desktop photo-editing tool'],
    explanation: 'Burbn was a check-in app. Its founders saw it was too close to Foursquare and narrowed it down to the feature people loved most: photo sharing.',
    lesson: 'Cutting scope can create the winner.',
    source: {
      title: 'Instagram, Wikipedia',
      url: wiki('Instagram'),
      quote: 'Instagram began development in San Francisco as Burbn, a mobile check-in app… they refocused their app on photo-sharing.',
    },
  },
  {
    id: 'instagram-price',
    prompt: 'In April 2012, Facebook acquired Instagram for approximately…',
    options: ['US$1 billion', 'US$5 billion'],
    explanation: 'Facebook paid about $1 billion in cash and stock.',
    lesson: 'Prices that look obvious later were contested at the time.',
    source: {
      title: 'Instagram, Wikipedia',
      url: wiki('Instagram'),
      quote: 'In April 2012, Facebook acquired the service for approximately US$1 billion in cash and stock.',
    },
  },
  {
    id: 'blockbuster-netflix',
    prompt: 'In 2000, Blockbuster turned down a chance to buy Netflix for…',
    options: ['$50 million', '$500 million'],
    explanation: 'Blockbuster passed on buying Netflix for $50 million. Netflix later became a major reason for its decline.',
    lesson: 'Incumbents misprice the bets that threaten them.',
    source: {
      title: 'Blockbuster LLC, Wikipedia',
      url: wiki('Blockbuster_LLC'),
      quote: 'Also in 2000, Blockbuster turned down a chance to purchase the fledgling Netflix for $50 million.',
    },
  },
  {
    id: 'whatsapp-price',
    prompt: 'In 2014, Facebook agreed to acquire WhatsApp for about…',
    options: ['US$19 billion', 'US$9 billion'],
    explanation: 'It was Facebook’s largest acquisition up to that point. The final value was about $19.3 billion.',
    lesson: 'Network effects get priced in fast.',
    source: {
      title: 'WhatsApp, Wikipedia',
      url: wiki('WhatsApp'),
      quote: 'Facebook, Inc. (now Meta Platforms) agreed to acquire the company for US$19 billion, its largest acquisition to date.',
    },
  },
  {
    id: 'groupon-point',
    prompt: 'Groupon grew out of an earlier product called The Point, which was…',
    options: ['A platform to rally people around a collective goal', 'A printable-coupon website for local stores'],
    explanation: 'The Point used a "tipping point" mechanic to organize people around causes. Group buying was one use case, and it became the company.',
    lesson: 'Look for the one use case that pulls.',
    source: {
      title: 'Groupon, Wikipedia',
      url: wiki('Groupon'),
      quote: 'In 2007 Mason launched The Point, a web platform based on the "tipping point" principle that would use social media to get people together to accomplish a goal.',
    },
  },
  {
    id: 'flickr-game',
    prompt: 'Flickr emerged from tools originally built for…',
    options: ['A web-based multiplayer game', 'A stock-photo licensing agency'],
    explanation: 'Ludicorp was building Game Neverending. The photo tools turned out to be the more viable product, so the game was shelved.',
    lesson: 'The same founder pivoted from a game twice (Flickr and later Slack).',
    source: {
      title: 'Flickr, Wikipedia',
      url: wiki('Flickr'),
      quote: "The service emerged from tools originally created for Ludicorp's Game Neverending, a web-based massively multiplayer online game.",
    },
  },
  {
    id: 'airbnb-cereal',
    prompt: 'Early on, Airbnb’s founders raised money by selling…',
    options: ['Cereal themed on the 2008 US presidential candidates', 'Branded T-shirts at tech conferences'],
    explanation: 'They raised about $30,000 selling cereal named after Obama and McCain. Paul Graham then invited them to Y Combinator.',
    lesson: 'Scrappiness is a signal investors notice.',
    source: {
      title: 'Airbnb, Wikipedia',
      url: wiki('Airbnb'),
      quote: 'After the founders raised $30,000 by selling cereal named after the two candidates of the 2008 United States presidential election…',
    },
  },
  {
    id: 'nintendo-1889',
    prompt: 'Nintendo was founded in 1889 to make…',
    options: ['Hanafuda playing cards', 'Wooden toys and puzzles'],
    explanation: 'Fusajiro Yamauchi founded Nintendo Koppai to produce handmade hanafuda cards. It started making toys in the 1960s.',
    lesson: 'Companies outlive their first product category.',
    source: {
      title: 'Nintendo, Wikipedia',
      url: wiki('Nintendo'),
      quote: 'Fusajiro Yamauchi founded the company in 1889 to produce handmade hanafuda playing cards.',
    },
  },
  {
    id: 'android-2005',
    prompt: 'Google acquired Android Inc. in…',
    options: ['2005, before the iPhone was announced', '2008, after the iPhone launched'],
    explanation: 'Google bought Android in July 2005 for at least $50 million. The iPhone was announced in January 2007.',
    lesson: 'Cheap early options can beat expensive late reactions.',
    source: {
      title: 'Android (operating system), Wikipedia',
      url: wiki('Android_(operating_system)'),
      quote: 'Google acquired the company in July 2005 for at least $50 million.',
    },
  },
  {
    id: 'github-price',
    prompt: 'In 2018, Microsoft announced it would acquire GitHub for…',
    options: ['US$7.5 billion', 'US$2.5 billion'],
    explanation: 'The deal was announced on June 4, 2018 and closed in October 2018.',
    lesson: 'Developer platforms are strategic assets.',
    source: {
      title: 'GitHub, Wikipedia',
      url: wiki('GitHub'),
      quote: 'On June 4, 2018, Microsoft announced its intent to acquire GitHub for US$7.5 billion.',
    },
  },
  {
    id: 'threads-vs-chatgpt',
    prompt: 'Which product reached 100 million users faster?',
    options: ['Threads (Meta)', 'ChatGPT (OpenAI)'],
    explanation: 'Threads passed 100M users in five days by riding Instagram’s existing accounts. ChatGPT took about two months. Engagement on Threads then dropped.',
    lesson: 'Distribution is not retention.',
    source: {
      title: 'Threads (social network), Wikipedia',
      url: wiki('Threads_(social_network)'),
      quote: 'Threads became the fastest-growing consumer software application in history, gaining over 100 million users in its first five days and surpassing the record previously set by ChatGPT.',
    },
  },
  {
    id: 'twitter-280',
    prompt: 'Twitter doubled its post limit from 140 to 280 characters in…',
    options: ['2017', '2013'],
    explanation: 'The limit stayed at 140 for over a decade and was doubled in 2017.',
    lesson: 'Core constraints can be product features.',
    source: {
      title: 'Twitter, Wikipedia',
      url: wiki('Twitter'),
      quote: 'Posts were initially limited to 140 characters, which was changed to 280 characters in 2017.',
    },
  },
  {
    id: 'figma-adobe',
    prompt: 'Adobe’s ~$20 billion deal to acquire Figma (announced 2022)…',
    options: ['Was abandoned in December 2023', 'Closed in 2023'],
    explanation: 'On December 18, 2023, Adobe and Figma both announced they had mutually agreed to abandon the deal.',
    lesson: 'Even signed deals are only bets.',
    source: {
      title: 'Figma (software), Wikipedia',
      url: wiki('Figma_(software)'),
      quote: 'On December 18, 2023, Figma and Adobe both announced they were mutually agreeing to abandon…',
    },
  },
  {
    id: 'shopify-snowboard',
    prompt: 'Shopify’s founders built it after first launching…',
    options: ['An online snowboard-equipment store', 'A payments API for developers'],
    explanation: 'The founders were unhappy with the e-commerce tools available for their store Snowdevil, so they built their own.',
    lesson: 'Your own pain can be the best discovery.',
    source: {
      title: 'Shopify, Wikipedia',
      url: wiki('Shopify'),
      quote: 'Shopify was founded in 2006 … after launching Snowdevil, an online store for snowboarding equipment, in 2004.',
    },
  },
  {
    id: 'gmail-storage',
    prompt: 'When Gmail launched on April 1, 2004, it offered…',
    options: ['1 GB of storage', '100 MB of storage'],
    explanation: '1 GB was far more than competitors offered at the time.',
    lesson: 'A 10x gap on one dimension can define a launch.',
    source: {
      title: 'Gmail, Wikipedia',
      url: wiki('Gmail'),
      quote: 'On April 1, 2004, Gmail was launched with one gigabyte (GB) of storage space, a significantly higher amount than competitors offered at the time.',
    },
  },
  {
    id: 'twitter-odeo',
    prompt: 'Twitter’s first prototype was used internally at…',
    options: ['Odeo, a podcasting company', 'A mobile SMS-gaming startup'],
    explanation: 'The prototype was an internal service for Odeo employees before Twitter launched publicly in July 2006.',
    lesson: 'Internal tools can be quiet experiments.',
    source: {
      title: 'Twitter, Wikipedia',
      url: wiki('Twitter'),
      quote: 'The first Twitter prototype, developed by Dorsey and contractor Florian Weber, was used as an internal service for Odeo employees.',
    },
  },
  {
    id: 'youtube-price',
    prompt: 'Google bought YouTube in 2006 for…',
    options: ['US$1.65 billion', 'US$650 million'],
    explanation: 'Google announced the $1.65B all-stock deal on October 9, 2006. It was finalized on November 13, 2006.',
    lesson: 'Paying up for a category leader can work.',
    source: {
      title: 'YouTube, Wikipedia',
      url: wiki('YouTube'),
      quote: 'On October 9, 2006, Google announced that they had acquired YouTube for $1.65 billion in Google stock.',
    },
  },
  {
    id: 'discord-game',
    prompt: 'Before Discord, its founding studio (Hammer & Chisel) first shipped…',
    options: ['A mobile multiplayer game called Fates Forever', 'A voice-chat plugin for Skype'],
    explanation: 'Fates Forever (2014) was not commercially successful. Citron had seen how hard existing VoIP tools made it for his team to coordinate in games, and that frustration led to Discord.',
    lesson: 'A failed product can fund the real insight.',
    source: {
      title: 'Discord, Wikipedia',
      url: wiki('Discord'),
      quote: 'Its first product was Fates Forever … but it was not commercially successful.',
    },
  },
]

export const QUIZ_LENGTH = 15
