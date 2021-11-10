/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains functions used to manage and process messages' data.
 */


const { Message } = require( "discord.js" );
const { WEBSITES, LIKE_EMOJI, REPOST_EMOJI } = require( "../files/config.json" );
const sqlUtils = require( "./sqlUtils" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Returns an array with all the links that are from memes' websites.
 * @param {Message} message A discord.Message object.
 * @returns {Promise<array[string]>} A Promise fulfilled with an array containing the memes' links.
 * 									 If there isn't any links, then the array is empty.
 */
async function getMemesLinks( message ) {
	let linksArray = [];
	for ( let wb of WEBSITES ) {
		let matches = message.content.match( wb );

		if ( matches ) {
			for ( let match of matches )
				linksArray.push( match );
		}
	}

	return linksArray;
}


/**
 * Returns true if the message has at least a meme.
 * @param {Message} message The message to check.
 * @returns {Promise<boolean>} Returns true if the message has at least a meme.
 */
async function hasMeme( message ) {
	for ( let wb of WEBSITES ) {
		let matches = message.content.match( wb );
		if ( matches ) {
			return true;
		}
	}

	return !!message.attachments.size;
}


/**
 * Add the message and its attachments to the database.
 * This function only do the treatments of the attachments, it call the sqlUtils.addMemeToDatabase() function
 * to add the message to the database.
 * @param {Message} message The message that will be added to the database.
 * @param {int} likes The number of likes on the message.
 * @param {int} reposts The number of reposts on the message.
 */
async function addMemeToDatabase( message, likes, reposts ) {
	let memesArray = await getMemesLinks( message );
	message.attachments.forEach( value => {
		memesArray.push( value );
	});

	await sqlUtils.sendMemeToDatabase( message, 0, 0, memesArray );
}


async function updateMessageReactions( messageReaction, user, client ) {
	// Checking if the bot is at the origin of the event.
	if ( user.id === client.id ) return;


	const channel = await sqlUtils.fetchChannel( messageReaction.message.channelId );

	if ( channel["memes"] ) {
		if ( messageReaction.emoji.name === LIKE_EMOJI ) {
			const messageDb = await sqlUtils.fetchMessage( messageReaction.message.id );
			// If the message is in the database.
			if ( messageDb ) {
				await sqlUtils.updateMessage(
					messageDb[0]["msg_id"],
					"likes",
					messageReaction.count - 1
				)
			}
			// We add the message in the database if it is not in.
			else {
				// TODO add message to database when not in.
			}
		}

		else if ( messageReaction.emoji.name === REPOST_EMOJI ) {
			const messageDb = await sqlUtils.fetchMessage( messageReaction.message.id );
			// If the message is in the database.
			if ( messageDb ) {
				await sqlUtils.updateMessage(
					messageDb[0]["msg_id"],
					"repost",
					messageReaction.count - 1
				)
			}
			// We add the message in the database if it is not in.
			else {
				// TODO add message to database when not in.
			}
		}
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	addMemeToDatabase,
	hasMeme,
	updateMessageReactions
}