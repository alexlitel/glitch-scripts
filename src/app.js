const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yargs = require('yargs');
const multiInterlace = require('./multiimage-interlace');
const GlitchShapes = require('./glitch-shapes');
const SlitscanShapes = require('./slitscan-shapes');
const ImageGenerate = require('./image-generate');
const randomLines = require('./random-lines');
const app = async () => {
	const args = _.omit(yargs.argv, ['_', '$0']);
	if (!args.process) args.process = 'genimage';
    
	let jpegImageData;
	switch(args.process) {
	case 'genimage':
		jpegImageData = await new ImageGenerate(args).render();
		break;
	case 'randomlines':
		jpegImageData = await randomLines(args);
		break;
	case 'interlace':
		jpegImageData = await multiInterlace(args);
		break;
	case 'slitscanshapes':
		jpegImageData = await new SlitscanShapes(args).render();
		break;
	case 'glitchshapes':
		jpegImageData = await new GlitchShapes(args).render();
		break;
	default:
		break;
	}
	
	const filePath = path.join(__dirname, '../output/', `glitch_${args.process}_${Date.now()}.jpg`);
	await fs.writeFileSync(filePath, jpegImageData.data);
};

app();