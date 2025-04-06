const core = require('@actions/core');
const Kutt = require('kutt').default;

async function run() {
  try {
    console.log('Starting Kutt URL shortener action...');
    
    const apiUrl = core.getInput('api-url');
    const apiKey = core.getInput('api-key');
    const targetUrl = core.getInput('target-url');

    console.log('Input parameters:');
    console.log(`- API URL: ${apiUrl}`);
    console.log(`- Target URL: ${targetUrl}`);
    console.log('- API Key: [REDACTED]');

    if (!apiUrl || !apiKey || !targetUrl) {
      const missing = [];
      if (!apiUrl) missing.push('api-url');
      if (!apiKey) missing.push('api-key');
      if (!targetUrl) missing.push('target-url');
      core.setFailed(`Missing required inputs: ${missing.join(', ')}`);
      return;
    }

    console.log('Initializing Kutt client...');
    // Initialize Kutt client
    const kutt = new Kutt();
    kutt.set('api', apiUrl).set('key', apiKey);

    console.log('Creating short link...');
    // Create short link
    const link = await kutt.links().create({
      target: targetUrl
    });

    if (link && link.shortUrl) {
      console.log('Successfully created short link:');
      console.log(`- Original URL: ${targetUrl}`);
      console.log(`- Shortened URL: ${link.shortUrl}`);
      console.log(`- Link ID: ${link.id}`);
      
      core.setOutput('short-url', link.shortUrl);
      core.setOutput('link-id', link.id);
    } else {
      console.error('Failed to get shortened URL from response');
      console.error('Response:', JSON.stringify(link, null, 2));
      core.setFailed('Failed to get shortened URL from response');
    }
  } catch (error) {
    console.error('Error occurred:');
    console.error(error.stack);
    core.setFailed(error.message);
  }
}

// Export for testing
module.exports = { run };

// Only run if this file is being executed directly
if (require.main === module) {
  run();
} 