// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.faqDatabase = { categories: {}, nextId: 1 };

// Database file path
const DB_PATH = path.join(__dirname, 'faq_database.json');

// Load FAQ database if exists
if (fs.existsSync(DB_PATH)) {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        client.faqDatabase = JSON.parse(data);
    } catch (err) {
        console.error('Error loading FAQ database:', err);
    }
}

// Save the FAQ database function for use throughout the app
client.saveDatabase = function() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(client.faqDatabase, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving FAQ database:', err);
    }
};

// Helper function for finding FAQ entries by ID
client.findFaqEntry = function(id) {
    for (const category in this.faqDatabase.categories) {
        const entry = this.faqDatabase.categories[category].find(faq => faq.id === id);
        if (entry) {
            return { entry, category };
        }
    }
    return { entry: null, category: null };
};

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(token);