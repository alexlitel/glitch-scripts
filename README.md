
# Glitch Scripts
This is a collection of NodeJS scripts I wrote a few years ago and recently rediscovered for the generation of glitch art and abstract art JPEG images. I barely knew what I was doing at the time, so the code is messy, duplicative and slow. I also barely understand most of the code in the scripts does, and there is a bunch of commented out code I left in that seems to change the scripts' effects. But I think the results of the scripts are still interesting enough to warrant sharing the scripts.


## Installation

Clone this repo and use NPM to install to install dependencies.

```
git clone https://github.com/alexlitel/glitch-scripts.git
cd glitch-scripts
npm install
```

## Usage
You can run the scripts with the following command. There are five process types, and other than `genimage`, all of them modify an external source image . Replace `<process type>` with one of the process types below and `options` are optional. 
```
node app --process=<process type> <options>
```

There's a `input` directory for the images for the image modification to consume with two demo images already inside. Scripts are non-destructive (i.e., they won't change the original file) and output images to the `output` directory in the format of `glitch_<process type>_<timestamp>.jpg`. You can also, of curse, play around with numbers and various things in the files to see how that affects imagery.

### Process types
* `genimage`: Generates an image of vertical and horizontal strips filled with solid colors and gradients. If you don't pass a process arg in the command line, this runs by default.
       **options**: 
         - `scanlines`: does some glitchy scanline effects
         - `size`: sets height and width of image
         - `height`: sets height
         - `width`: sets width
         - `count`: sets # of horizontal strips
         - `div`: sets # of vertical strips

* `glitchshapes`: Performs glitchy shape or line effects to a source image.
       **options**: 
         - `file`: input file for script to consume. Must be JPEG inside the `input` directory
         -  `div`: sets # of vertical stripes
         - `lines`: enables line effects

* `interlace`: Combines two source images in an interlace-type manner.
       **options**: 
           - `fileOne`: first input file for script to consume Must be JPEG inside the `input` directory.
         - `fileTwo`: second input file for script to consume Must be JPEG inside the `input` directory.

* `randomlines`: Shuffles a source image into random stripes. 
       **options**: 
         - `file`: input file for script to consume. Must be JPEG inside the `input` directory
        
* `slitscanshapes`: Performs slitscan-type shape or line effects on a source image.
       **options**: 
         - `file`: input file for script to consume. Must be JPEG inside the `input` directory
         - `squares`: enables shape effects
         - `div`: sets # of vertical stripes

## Contributing
I probably will not be changing these scripts much, but if you can decipher these scripts and make any improvements that don't make them less accessible, feel free to do so.
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
Not sure yet, but you can use the derivative images for free or commercial use.