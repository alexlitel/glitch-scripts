'use strict';
const _ = require('lodash');
const jpeg = require('jpeg-js');


class ImageGenerate {
	getColor() {
		return Math.floor(Math.random() * 256);
	}

	genRand() {
		const col = Array.from(Array(3).keys()).map(() => '0x' + this.getColor().toString(16));
		return this.scanlines || this.brightness ? this.checkBrightness(col) : col;
	}

	changeColor(col, rules) {
		return col.map((x, i) => {
			const added = Number(x) + rules[i];
			return added === 0 || added === 255 ? x : '0x' + added.toString(16);
		});
	}
    
	genRules(divisions) {
		return Array.from(Array(divisions))
			.map(x =>
				Array.from(Array(3))
					.map(y => {
						const num = Math.random();
						if (num > .7) return 1;
						else if (num < .15) return -1;
						else return 0;
					})
			);
	}

	async createObjs() {
		if (this.scanlines) {
			let objs = Array(this.count).fill([]);
			let num = 0;
			while (num < this.div) {
				let objCount = 0;
				for (let obj of objs) {
					let col;
					if (
						num === 0 ||
                        objCount % 2 === 0 ||
                        num % 5 === 0 ||
                        num % 8 === 0
					) {
						col = this.genRand();
					} else {
						col = objCount > 0 ? objs[objCount - 1][num] : objs[objCount][num - 1];
					}
					await objs[objCount].push(col);
					objCount++;
				}
				num++;
			}
			return objs;
		}
		let arr = [];
		let arrCount = 0;
		while (arrCount < this.count) {
			const divCount = await this.getRandom(this.div);
			const rules = await this.genRules(divCount);
			let rowArr = [];
			let lineCount = 0;
			while (lineCount < this.lineDiv) {
				const currRow = await Array.from(Array(divCount).keys()).map((x) =>
					lineCount === 0 ? this.genRand() : this.changeColor(rowArr[lineCount - 1][x], rules[x])
				);
				await rowArr.push(currRow);
				lineCount++;
			}
			await arr.push(rowArr);
			arrCount++;
		}
		return arr;
	}

	genFrameData() {
		return this.scanlines ? Buffer.allocUnsafe(this.width * this.height * 4) 
			: _.chunk(Array.from(Array(this.height).keys()), this.lineDiv)
				.map(() => Array.from(Array(this.lineDiv).keys()));
	}

	checkBrightness(colors) {
		let arr = colors.map(i => parseInt(i));
		let avg = arr.reduce((p, c, i) => {
			return p + c;
		}) / 3;
		if (!this.scanlines) {
			let range = Math.max(...arr) - Math.min(...arr);
			if (avg < 130) {
				let min = Math.min(...arr);
				colors[arr.indexOf(min)] = '0x' + Number(180 + Math.floor(Math.random() * 40)).toString(16);
			}
			if (range < 25) {
				let min = Math.min(...arr);
				let range = 255 - min;


				let rand = Math.floor(Math.random() * range);

				colors[arr.indexOf(min)] = '0x' + Number(Math.floor(Math.random() * (255 - min))).toString(16);
			}
		}
        
		return colors;

	}

	async render() {
		let i = 0;
		let lineCount = this.scanlines ? 1 : 0;
		let track = 0;
		let track2 = 0;
		let rev = false;
		let curr;
		let color;
		let single = [];
		let obj = await this.createObjs();
		let nums = Array.from(Array(this.div).keys());
		let frameData = await this.genFrameData();
		let line;
		let val = 0;
		if (this.scanlines) {
			let change;
			while (i < frameData.length) {
				if (i % this.lineWidth === 0) {
					lineCount++;
					track = 0;
					track2 = 0;
					if (i !== 0 && lineCount % (this.height / 50) === 0) {
						// val = Math.floor(Math.random() * obj.length);
						val = val === obj.length - 1 ? 0 : val + 1;
					}
					if (i === 0 || (lineCount % (this.height / 4) === 0)) {
						line = _.shuffle(nums);
					}

					if (lineCount % (this.height / 100) === 0) {
						rev = !rev;
						if (rev) {
							single = this.genRand();
						}
					} else if (i % 150 === 0) {
						rev = !rev;
						change = true;
					} else {
						change = false;
					}

					curr = obj[val];
					color = rev ? single : curr[line[track]];
				}

				if (!rev) {
					if (track2 % (this.lineWidth / this.div) === 0) {
						track = (track + 1 === curr.length || track2 === 0) ? 0 : track + 1;
						color = curr[line[track]];
					}
				}

				frameData[i++] = color[0]; // red
				frameData[i++] = color[1]; // green
				frameData[i++] = color[2]; // blue

				frameData[i++] = 0xff; // alpha - ignored in JPEGs

				track2 += 4;
			}

		} else {
			let count1 = 0;
			for (let item of frameData) {
				for (let subItem of item) {
           

					const count2 = subItem;
                            
					let curr = obj[val][count2];
					let divCount = curr.length;
					let division = Math.floor(this.width / divCount);
					frameData[count1][count2] = _.chunk(Array.from(Array(this.width)), division)
						.reduce((p, c, i) => {
							p.track = (p.track + 1 === curr.length || i === 0) ? 0 : p.track + 1;
							color = curr[p.track];
							const newBuff = c.fill((() => Buffer.from([...color, '0xff']))());
							p.data.push(...newBuff);
							return p;
						}, {
							track: 0,
							data: []
						}).data;
					frameData[count1][count2] = await Buffer.concat(frameData[count1][count2]);
				}
				frameData[count1] = await Buffer.concat(frameData[count1]);
				val = val === obj.length - 1 ? 0 : val + 1;
				count1 = count1 + 1;

			}
			frameData = await Buffer.concat(frameData);
		}
		const rawImageData = {
			data: frameData,
			width: this.width,
			height: this.height
		};
		return jpeg.encode(rawImageData, 100);

	}

	getRandom(num) {
		let newNum = Math.floor(Math.random() * num) || 1;
		if ((num === 21 || num === 11) && newNum < 2) {
			newNum = 2;
		}

		return newNum;
	}
	constructor(args = {}) {
		this.height = +args.size || 2500;
		this.width = +args.size || 2500;
		this.count = +args.count || 20;
		this.lineDiv = Math.floor(this.height / this.count);
		this.div = args.randomDiv && this.getRandom() || 25;
		this.lineWidth = this.width * 4;
		Object.assign(this, args);
	}
}


module.exports = ImageGenerate;