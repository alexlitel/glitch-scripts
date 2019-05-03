'use strict';
const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

function getBuffer(height, lineWidth) {
	let line, count, calc;
	calc = {};
	count = Math.floor(Math.random() * height);
	if (count < 50) {
		count += 50;
	}
	calc.floor = count * lineWidth,
	calc.ceil = calc.floor + lineWidth;
	return calc;
}

const multiInterlace = async (args = {}) => {
	const fileOne = jpeg.decode(await fs.readFileSync(path.join(__dirname, '../input/', args.fileOne || 'demo.jpg')));
	const fileTwo = jpeg.decode(await fs.readFileSync(path.join(__dirname, '../input/', args.fileOne || 'demo2.jpg')));
    
	let val = false;
	let lineWidth = fileOne.width * 4;
	let newData = Buffer.allocUnsafe(lineWidth * fileOne.height);
	let lineCount = 0;
	let track = 0;
	let curr, currLine;
	let limit = {
		one: Math.floor(Math.random() * 141),
		two: Math.floor(Math.random() * 151),
		three: Math.floor(Math.random() * 121)
	};
	if (limit.one < 30) {
		limit.one = 30;
	}
	if (limit.two < 40) {
		limit.two = 40;
	}
	if (limit.two < 20) {
		limit.two = 20;
	}
	let calc = {};

	await fileOne.data.forEach(function async (item, i) {
		if (i % lineWidth === 0) {
			lineCount++;
			if (lineCount > 1 && lineCount % limit.one === 0) {
				val = !val;
			}
			if (lineCount === 1 || lineCount % limit.two === 0) {
				calc = getBuffer(fileOne.height, lineWidth);
				currLine = val ? fileTwo.data.slice(calc.floor, calc.ceil) : fileOne.data.slice(calc.floor, calc.ceil);
			} else if (calc.floor + lineWidth < fileOne.data.length - 1 /*&& lineCount % limit.three === 0 */ ) {
				calc.floor += lineWidth;
				calc.ceil += lineWidth;
				currLine = val ? fileTwo.data.slice(calc.floor, calc.ceil) : fileOne.data.slice(calc.floor, calc.ceil);

			}
			currLine = !val ? fileOne.data.slice(i, i + lineWidth) : fileTwo.data.slice(i, i + lineWidth);
			curr = !val ? currLine : Math.random() > .5 ? currLine : currLine.reverse();
			track = 0;
		}


		newData[i] = currLine[track++];
	});

	const rawImageData = {
		data: newData,
		width: fileOne.width,
		height: fileOne.height
	};
	return jpeg.encode(rawImageData, 100);


};

module.exports = multiInterlace;