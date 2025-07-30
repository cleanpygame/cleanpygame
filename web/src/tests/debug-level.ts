import {topics} from '../data/levels.json';
import {applyEvents} from '../utils/pylang';

// Get the blocks from the first level in the first topic
const blocks = topics[0].levels[0].blocks;

// Apply events to get the code
const result = applyEvents(blocks, []);

// Log the code
console.log(JSON.stringify(result.code));