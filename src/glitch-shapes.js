'use strict';
const fs = require('fs');
const jpeg = require('jpeg-js');
const path = require('path');
const _ = require('lodash');

class GlitchShapes {
	getBuffer(height, lineWidth) {
		let count;
		let calc = {};
		count = Math.floor(Math.random() * height);
		if (count < 50) {
			count += 50;
		}
		calc.floor = count * lineWidth,
		calc.ceil = calc.floor + lineWidth;
		return calc;
	}

	getLimits() {
		let limit = {
			one: this.lines ? Math.floor(Math.random() * 141) : 300,
			two: this.lines ? Math.floor(Math.random() * 151) : 100,
			three: this.lines ? Math.floor(Math.random() * 121) : 320
		};
		if (this.lines) {
			if (limit.one < 30) {
				limit.one = 30;
			}
			if (limit.two < 40) {
				limit.two = 40;
			}
			if (limit.two < 20) {
				limit.two = 20;
			}
		} else {
			// if (limit.one < 30) {
			//     limit.one = 30;
			// }
			// if (limit.two < 40 || limit.one > limit.two) {
			//     limit.two = limit.one > limit.two ? limit.one + 20 : 40;
			// }
			// if (limit.three < 20) {
			//     limit.three = 20;
			// }
		}

		return limit;
	}

	async render() {
		const fileData = await fs.readFileSync(path.join(__dirname, '../input/', this.file));
		let dataOne = await jpeg.decode(fileData);
		let dataTwo = await jpeg.decode(fileData);
		let val = false;
		let lineWidth = dataOne.width * 4;
		let lineCount = 0;
		let track = 0;
		let track2 = 0;
		let div = Math.floor(Math.random() * this.div);
		let exactDiv = Math.floor(lineWidth / div);

		let nums = Array.from(Array(div).keys());
		let curr, currLine;
		let limit = await this.getLimits();
		let calc = {};
		if (this.lines) {
			await dataOne.data.forEach(async (item, i) => {

				if (i % lineWidth === 0) {
					lineCount++;
					if (lineCount > 1 && lineCount % limit.one === 0) {
						val = !val;
					}
					if (lineCount === 1 || lineCount % limit.two === 0) {
						if (lineCount == 1) this.getBuffer(dataOne.height, lineWidth);
						// limit = this.getLimits();
						exactDiv = Math.floor(lineWidth / div);
						nums = _.shuffle(nums);
					} else if (calc.floor + lineWidth < dataOne.data.length - 1) {
						calc.floor += lineWidth;
						calc.ceil += lineWidth;
					}
					currLine = dataTwo.data.slice(calc.floor, calc.ceil);
					curr = !val ? currLine : currLine.reverse();
					track = val ? lineWidth : 0;
					track2 = 0;
				}
				if (track === 0 || (track % exactDiv === 0)) {
					let start = exactDiv;
					curr = currLine.slice(start, start + exactDiv);
					track2++;
					track = 0;
				}

				dataOne.data[i] = currLine[track++];
			});

		} else {
			await dataOne.data.forEach(async (item, i) => {
				if (i % lineWidth === 0) {
					lineCount++;
					if (lineCount > 1 && lineCount % limit.one === 0) {
						val = !val;
					}
					if (lineCount === 1 || lineCount % limit.two === 0) {
						calc = this.getBuffer(dataOne.height, lineWidth);
					} else if (calc.floor + lineWidth < dataOne.data.length - 1 && lineCount % limit.three === 0) {
						calc.floor += lineWidth;
						calc.ceil += lineWidth;
					}
					currLine = dataTwo.data.slice(calc.floor, calc.ceil);
					// currLine = !val ? dataTwo.data.slice(i, i + lineWidth) : dataTwo.data.slice(i, i + lineWidth);
					// curr = !val ? currLine : Math.random() > .5 ? currLine : currLine.reverse();
					track = val ? lineWidth : 0;
					track2 = val ? 4 : 0;
				}
				if (val && track2 === 4) {
					track2 = 0;
					curr = currLine.slice(track - 4, track);
				} else {
					curr = currLine;
				}
				if (track2 !== 3) dataOne.data[i] = curr[track2];
				else dataOne.data[i] = '0xff';


				track2++;
				track = val ? track - 1 : track + 1;
			});
		}

		const rawImageData = {
			data: dataOne.data,
			width: dataOne.width,
			height: dataOne.height
		};
		return jpeg.encode(rawImageData, 100);
	}

	constructor(args) {
		this.file = 'demo.jpg';
		this.div = 13;
		Object.assign(this, args);
	}

}

module.exports = GlitchShapes;