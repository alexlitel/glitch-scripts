'use strict';
const fs = require('fs');
const jpeg = require('jpeg-js');
const path = require('path');
const _ = require('lodash');

class SlitscanShapes {
	getBuffer(height, lineWidth) {
		let line, count, calc;
		calc = {};
		count = Math.floor(Math.random() * height);
		if (count < 50) {
			count += 50;
		}
		calc.floor = count * lineWidth;
		calc.ceil = calc.floor + lineWidth;
		return calc;
	}
	getLimits(lines) {
		let limit = {
			one: this.squares ? 585 : Math.floor(Math.random() * 141),
			two: this.squares ? 535 : Math.floor(Math.random() * 151),
			three: this.squares ? 300 : Math.floor(Math.random() * 121)
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

		if (this.squares) {
			limit.one = Math.floor(lines / limit.one);
			limit.two = Math.floor(lines / limit.two);
			limit.three = Math.floor(lines / limit.three);
		}
		return lines;
	}
	async render() {
		const fileData = await fs.readFileSync(path.join(
			__dirname, '../input', this.file));
		let dataOne = await jpeg.decode(fileData);
		let dataTwo = await jpeg.decode(fileData);
		let val = false;
		let lineWidth = dataOne.width * 4;
		let lineCount = 0;
		let lines = dataOne.height;
		let track = 0;
		let track2 = 0;
		let div = this.div;
		let exactDiv = Math.floor(lineWidth / div);
		let nums = Array.from(Array(div).keys());
		let curr, currLine;
		let limit = this.getLimits(lines);
		let calc = {};

		if (this.squares) {
			await dataOne.data.forEach(async (item, i) => {
				if (i % lineWidth === 0) {
					lineCount++;
					// if (lineCount > 1 && lineCount % limit.one === 0) {
					//     val = !val;
					// }
					if (lineCount === 1 || lineCount % limit.two === 0) {
						calc = this.getBuffer(dataOne.height, lineWidth);
						// div = Math.floor(Math.random() * 21);
						// if (div < 4) div = 4;
						exactDiv = Math.floor(lineWidth / div);
						// limit = getLimits();
						nums = _.shuffle(Array.from(Array(div).keys()));
					} else if (calc.floor + lineWidth < dataOne.data.length - 1 /* && lineCount % limit.three === 0*/ ) {
						calc.floor += lineWidth;
						calc.ceil += lineWidth;
					}
					currLine = dataTwo.data.slice(calc.floor, calc.ceil);
					curr = currLine;
					// curr = !val ? currLine : currLine.reverse();
					track = 0;
					track2 = 0;
				}
				if (track === 0 || (track % exactDiv === 0)) {
					let start = exactDiv;
					curr = currLine.slice(start, start + exactDiv);
					track2++;
					track = 0;
				}

				dataOne.data[i] = curr[track++];

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
						limit = this.getLimits(lines);
						nums = _.shuffle(Array.from(Array(div).keys()));
					} else if (calc.floor + lineWidth < dataOne.data.length - 1 && lineCount % limit.three === 0) {
						calc.floor += lineWidth;
						calc.ceil += lineWidth;
					}
					currLine = dataTwo.data.slice(calc.floor, calc.ceil);
					curr = currLine;
					// curr = !val ? currLine : currLine.reverse();
					track = 0;
					track2 = 0;
				}
				if (track === 0 || track % exactDiv === 0) {
					let start = exactDiv * nums[track2];
					curr = currLine.slice(start, start + exactDiv);
					track2++;
					track = 0;
				}

				dataOne.data[i] = curr[track++];

			});
		}

		const rawImageData = {
			data: dataOne.data,
			width: dataOne.width,
			height: dataOne.height
		};
		return jpeg.encode(rawImageData, 100);

	}
	constructor(args = {}) {
		this.file = 'demo.jpg';
		this.div = 25;
		Object.assign(this, args);
	}
}

module.exports = SlitscanShapes;