const core = require('@actions/core');
const Kutt = require('kutt').default;

async function run() {
  try {
    console.log('Starting Kutt URL shortener action...');

    const apiUrl = core.getInput('api-url');
    const apiKey = core.getInput('api-key');
    const target = core.getInput('target-url');
    const description = core.getInput('description');
    const expireIn = core.getInput('expire-in');
    const reuse = Boolean(core.getInput('reuse'));
    const domain = core.getInput('domain');

    console.log('Input parameters:');
    console.log(`- API URL: ${apiUrl}`);
    console.log(`- Target URL: ${target}`);
    console.log('- API Key: [REDACTED]');

    if (!apiUrl || !apiKey || !target) {
      const missing = [];
      if (!apiUrl) missing.push('api-url');
      if (!apiKey) missing.push('api-key');
      if (!target) missing.push('target-url');
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
      target,
      description,
      expire_in: expireIn,
      reuse,
      domain,
    });

    if (link && link.link) {
      console.log('Successfully created short link:');
      console.log(`- Original URL: ${target}`);
      console.log(`- Shortened URL: ${link.link}`);
      console.log(`- Link ID: ${link.id}`);

      core.setOutput('link', link.link);
      core.setOutput('id', link.id);
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
