const fs = require('fs');
const jpeg = require('jpeg-js');
const path = require('path');
const _ = require('lodash');

function getBuffer(lineWidth, height) {
	const calc = {};
	let count = Math.floor(Math.random() * height);
	if (count < 50) {
		count += 50;
	}
	calc.floor = count * lineWidth,
	calc.ceil = calc.floor + lineWidth;
	return calc;
}

function getLimits() {
	let limit = {
		one: Math.floor(Math.random() * 141),
		two: Math.floor(Math.random() * 151),
		three: Math.floor(Math.random() * 121)
	};

	if (limit.one < 30) {
		limit.one = 30;
	}
	if (limit.two < 40 || limit.one > limit.two) {
		limit.two = limit.one > limit.two ? limit.one + 20 : 40;
	}
	if (limit.three < 20) {
		limit.three = 20;
	}
	return limit;
}


const randomLines = async (args) => {
	const file = path.join(__dirname, '../input/', args.file || 'demo.jpg');
	const fileData = jpeg.decode(await fs.readFileSync(file));
	const byteSize = fileData.width * fileData.height * 4;
	let lineWidth = fileData.width * 4;
	let i = 0;
	let val = false; // track whether normal or reversed scanlines
	let lineCount = 0;
	let track = 0;
	let track2 = 0;
	let curr;
	let currLine; // storage for writing/reading scnalines, respectively
	let limit = getLimits();
	let calc = {};
	calc.floor = 0;
	calc.ceil = 0 + lineWidth;
	let newData = Buffer.allocUnsafe(byteSize);
    
	while (i < byteSize) {
		if (i % lineWidth === 0) {
			lineCount++;
			if (lineCount > 1 && lineCount % limit.one === 0) {
				val = !val;
			}
			if (lineCount === 1 || lineCount % limit.two === 0) {
				calc = getBuffer(fileData.width * 4, fileData.height);
				// limit = getLimits();
				// val = !val; // setting alt scanline check to true initially
			} else if (calc.floor + lineWidth < newData.length - 1 /*&& lineCount % limit.three === 0*/ ) {
				calc.floor += lineWidth;
				calc.ceil += lineWidth;
			}
			currLine = fileData.data.slice(calc.floor, calc.ceil); // current line
			track = val ? lineWidth : 0; // tracking variable for reading from scanline
			track2 = val ? 4 : 0; // tracking variable for writing from scanline
		}
		//check if reversed and writing variable has written 4 bytes for RGBA
		//if so, set writing source to 4 bytes at end of line and read from there incrementally
		if (val) {
			if (track2 === 4) {
				track2 = 0; // reset writing count
				curr = currLine.slice(track - 4, track); // store 4 previous bytes as writing source
			}
		} else {
			curr = currLine; //set normal scanline
		}

		newData[i] = curr[track2];
		track2++; //update tracking variable
		track = val ? track - 1 : track + 1; //update tracking variable
		i = i + 1;
	}
	const rawImageData = {
		data: newData,
		width: fileData.width,
		height: fileData.height
	};
    
	return jpeg.encode(rawImageData, 100);

};
module.exports = randomLines;