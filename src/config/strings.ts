export const brand = {
  name: 'Helpdock',
  tagline: 'Turn your store docs into a support agent',
  domain: 'helpdock.app',
};

export const marketing = {
  nav: { pricing: 'Pricing', howItWorks: 'How it works', signIn: 'Sign in', start: 'Start free', dashboard: 'Dashboard' },
  hero: {
    eyebrow: 'Support automation for online stores',
    title: 'Your returns policy already knows the answer.',
    subtitle:
      'Helpdock reads the docs you already have — shipping terms, returns policy, product FAQ — and turns them into a support agent that answers on your storefront in seconds, day or night.',
    primary: 'Start free',
    secondary: 'See how it works',
    note: 'No credit card. One chatbot free forever.',
  },
  problem: {
    title: 'The same six questions, every single day',
    body:
      'Where is my order. Can I return this. Do you ship to Poland. How long does delivery take. Your team answers them by hand while real problems wait in the queue. The answers are already written down — they are just not where your customers are looking.',
    stats: [
      { value: '68%', label: 'of support tickets in retail repeat information already published on the site' },
      { value: '9 min', label: 'median first reply time customers abandon a cart over' },
      { value: '24/7', label: 'hours your storefront is open and your support desk is not' },
    ],
  },
  steps: {
    title: 'Three steps, about five minutes',
    items: [
      {
        title: 'Upload what you already wrote',
        body: 'Drop in a PDF, paste your returns page URL, or type the answer in. Helpdock splits it, indexes it and tells you when it is ready.',
      },
      {
        title: 'Ask it anything',
        body: 'A ChatGPT-style chat inside the app lets you test the agent before a single customer sees it. Every answer shows which document it came from.',
      },
      {
        title: 'Paste one line on your site',
        body: 'A single script tag puts the chat bubble on your storefront. It answers from the same knowledge, in your colours, under your name.',
      },
    ],
  },
  features: {
    title: 'Built for a storefront, not a wiki',
    items: [
      {
        title: 'Answers with receipts',
        body: 'Every reply names the document behind it, so you can see instantly whether the agent is quoting your real policy or reaching.',
      },
      {
        title: 'It says "I do not know"',
        body: 'When your documents do not cover a question, the agent says so and points to your team. It does not invent a delivery date.',
      },
      {
        title: 'The questions inbox',
        body: 'Every conversation from your storefront is saved. Read what customers actually ask and you will know which page to write next.',
      },
      {
        title: 'Your brand, not ours',
        body: 'Set the name, greeting and accent colour. On paid plans the Helpdock badge comes off entirely.',
      },
    ],
  },
  pricing: {
    title: 'Pricing that follows your volume',
    subtitle: 'Start free with one chatbot. Upgrade when your storefront outgrows it.',
    cta: { free: 'Start free', paid: 'Upgrade', current: 'Current plan' },
    perMonth: '/month',
    popular: 'Popular',
    testNote: 'This demo runs Stripe in test mode — card 4242 4242 4242 4242 completes a real checkout without a real charge.',
  },
  finalCta: {
    title: 'Your documentation is already doing the work. Let it answer.',
    body: 'Set up your first chatbot in five minutes and see what your customers have been asking.',
    button: 'Start free',
  },
  heroChat: {
    botName: 'Northline Supply',
    turns: [
      { role: 'user', text: 'I ordered boots on Friday, do they arrive before the weekend?' },
      {
        role: 'assistant',
        text: 'Standard delivery inside the EU takes 2 to 4 working days, so a Friday order normally lands Tuesday or Wednesday. You will get a tracking link by email the moment it ships.',
        source: 'shipping-and-delivery.pdf',
      },
      { role: 'user', text: 'And if they do not fit?' },
      {
        role: 'assistant',
        text: 'You have 30 days to send them back unworn, and return shipping inside the EU is on us. Start it from the returns link in your order email.',
        source: 'returns-policy.pdf',
      },
    ],
    sourceLabel: 'Answered from',
  },
  footer: { rights: 'Helpdock — demo product built for the Paralect Product Academy assignment.' },
  widgetDemo: {
    title: 'Ask this page anything',
    body: 'The bubble in the corner is a real Helpdock widget, loaded from the same script tag you would paste on your storefront. Its knowledge is this landing page.',
  },
};

export const auth = {
  signInTitle: 'Sign in to Helpdock',
  signUpTitle: 'Create your Helpdock account',
  email: 'Email',
  password: 'Password',
  signIn: 'Sign in',
  signUp: 'Create account',
  toSignUp: 'No account yet? Create one',
  toSignIn: 'Already have an account? Sign in',
  checkEmail: 'Check your inbox to confirm the address, then sign in.',
  passwordHint: 'At least 8 characters.',
};

export const app = {
  nav: { bots: 'Chatbots', billing: 'Billing', signOut: 'Sign out' },
  bots: {
    title: 'Your chatbots',
    subtitle: 'Each chatbot has its own knowledge and its own embed code.',
    create: 'New chatbot',
    createTitle: 'Name your chatbot',
    namePlaceholder: 'Storefront support',
    welcomePlaceholder: 'Hi! Ask me about shipping, returns or your order.',
    nameLabel: 'Name',
    welcomeLabel: 'Greeting shown when the chat opens',
    submit: 'Create chatbot',
    empty: 'No chatbots yet. Create one and give it something to read.',
    sources: 'sources',
    open: 'Open',
  },
  tabs: { sources: 'Knowledge', chat: 'Chat', embed: 'Embed', inbox: 'Inbox' },
  sources: {
    title: 'Knowledge',
    subtitle: 'What this chatbot is allowed to answer from.',
    uploadTitle: 'Upload a file',
    uploadHint: 'PDF, Markdown or plain text, up to 10 MB.',
    urlTitle: 'Import a page',
    urlHint: 'Paste the URL of your returns, shipping or FAQ page.',
    urlPlaceholder: 'https://yourstore.com/returns',
    textTitle: 'Write it yourself',
    textHint: 'Paste or type an answer the agent should know.',
    textTitlePlaceholder: 'Holiday delivery times',
    add: 'Add',
    importing: 'Indexing…',
    empty: 'Nothing indexed yet. Add your first document and the chat comes alive.',
    remove: 'Remove',
    chars: 'characters',
    chunks: 'passages',
    status: { pending: 'Queued', processing: 'Indexing', ready: 'Ready', failed: 'Failed' },
  },
  chat: {
    title: 'Chat',
    subtitle: 'The same agent your customers will talk to.',
    placeholder: 'Ask what a customer would ask…',
    send: 'Send',
    sources: 'Answered from',
    empty: 'Ask your first question.',
    thinking: 'Looking it up…',
  },
  embed: {
    title: 'Embed',
    subtitle: 'Paste this once, anywhere before the closing body tag.',
    copy: 'Copy',
    copied: 'Copied',
    preview: 'Live preview',
    appearance: 'Appearance',
    accent: 'Accent colour',
    persona: 'Tone of voice',
    personaHint: 'Tell the agent how to sound. Available on paid plans.',
    personaPlaceholder: 'Warm and brief. Always offer the tracking link when delivery comes up.',
    save: 'Save',
    saved: 'Saved',
    danger: 'Delete this chatbot',
    dangerHint: 'Its knowledge, conversations and embed code are removed for good.',
    delete: 'Delete',
    cancel: 'Cancel',
  },
  inbox: {
    title: 'Inbox',
    subtitle: 'What people asked your chatbot.',
    empty: 'No conversations yet. They appear here as soon as someone uses the widget.',
    locked: 'The questions inbox is part of the paid plans.',
    lockedCta: 'See plans',
    channel: { app: 'In app', widget: 'Widget' },
    messages: 'messages',
  },
  billing: {
    title: 'Billing',
    subtitle: 'Your plan, your usage and what happens when you outgrow it.',
    currentPlan: 'Current plan',
    usage: 'This month',
    chatbots: 'Chatbots',
    knowledge: 'Knowledge',
    answers: 'Answers',
    manage: 'Manage subscription',
    upgraded: 'Upgrade complete. Your new limits are live.',
    disabled: 'Stripe is not configured in this environment, so checkout is unavailable.',
  },
  errors: {
    generic: 'Something went wrong. Try again.',
    fileTooLarge: 'That file is larger than 10 MB.',
    unsupportedFile: 'Upload a PDF, Markdown or plain text file.',
    emptyUrl: 'Enter a valid URL starting with http or https.',
    notFound: 'That chatbot does not exist or is not yours.',
    noProfile: 'Your account is still being set up. Reload the page and try again.',
    nameRequired: 'Give the chatbot a name.',
    titleRequired: 'Give this note a title and some text.',
  },
};

export const widget = {
  poweredBy: 'Powered by Helpdock',
  placeholder: 'Ask a question…',
  send: 'Send',
  offline: 'The assistant is unavailable right now.',
};
