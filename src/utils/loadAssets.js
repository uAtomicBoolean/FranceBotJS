/**
 * @author Benjamin Guirlet
 * @description
 * 		The file contains the functions to load the commands and events in the bot at startup.
 */


const { Client } = require( "discord.js" );

// Used to get all the directory of the commands and events.
const { promisify } = require( "util" );
const { glob } = require( "glob" );
const globPromise = promisify( glob );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Load the commands in the client.
 * @param {Client} client The client of the bot.
 */
async function loadCommands( client ) {
	const files = await globPromise( `${process.cwd()}/commands/*/*.js` );
	files.map( file => {
		const command = require( file );
		client.commands.set( command.data.name, command );
	});
}


/**
 * Load the events in the client.
 * @param {Client} client The client of the bot.
 */
async function loadEvents( client ) {
	const files = await globPromise( `${process.cwd()}/events/*.js` );
	files.map( file => {
		const event = require( file );
		if ( event.once )
			client.once( event.name, ( ...args ) => event.execute( ...args, client ) );
		else
			client.on( event.name, ( ...args ) => event.execute( ...args, client ) );
	});
}


/**
 * Load the commands into the specified guild.
 * @param {Client} client The client of the bot.
 * @param {string} guildId The guild's ID.
 */
async function loadCommandsToGuild( client, guildId ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	await client.guilds.cache.get( guildId ).commands.set( commandsArray );
	console.log( "Commande loaded!" );
}


/**
 * Used to load the commands in all the guids where the client is present.
 * @param {Client} client The bot's client.
 */
async function loadCommandToAllGuilds( client ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	await client.application.commands.set( commandsArray );
	console.log( "Commande loaded! The commands may take up to an hour before being available on the guilds." );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	loadCommands,
	loadEvents,
	loadCommandsToGuild,
	loadCommandToAllGuilds
}
