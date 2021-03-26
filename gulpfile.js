const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass");
const prefix = require("gulp-autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");

const fs = require("fs");



function createFiles () {
    createFolders();

    setTimeout(() => {
        fs.writeFile("app/index.html", "!", function (err) {
            if ( err ) {
                throw err;
            }
            console.log("File created");
        });
        fs.writeFile("app/scss/style.scss", "", function (err) {
            if ( err ) {
                throw err;
            }
            console.log("File created");
        });
        fs.writeFile("app/js/draft/main.js", "", function (err) {
            if ( err ) {
                throw err;
            }
            console.log("File created");
        });
    }, 500);    
};

function createFolders (){
    return src("*.*", {read: false })
    .pipe(dest("./app/scss/"))
    .pipe(dest("./app/css/"))
    .pipe(dest("./app/img/"))
    .pipe(dest("./app/_img/"))
    .pipe(dest("./app/js/draft/"))
    .pipe(dest("./dist/css/"))
    .pipe(dest("./dist/img/"))
    .pipe(dest("./dist/js/"))
};



function convertStyles () {
    return src('app/scss/style.scss')
    .pipe(scss(
        {
            outputStyle: 'compressed'
        }
    )) 
    .pipe(prefix({
        cascade: true,
        grid: true,
        flexbox: true
    }))
    .pipe(dest('app/css'));
};

function imagesCompressed () {
    return src('app/_img/*.{jpg,png,svg}')
    .pipe(imagemin())
    .pipe(dest('app/img'))
};

function browserSync () {
    sync.init({
        server: {
            baseDir: "app",
            open: "local" 
        }
    });
};

function watchFiles () {
    watch('app/scss/**/*.scss', watchFiles);

    watch('app/*.html').on("change", sync.reload);
    watch('app/css/*.css').on("change", sync.reload);
    watch('app/js/*.js').on("change", sync.reload);
    
    watch('app/js/draft/*.js', uglifyJS);
    watch('app/_img', imagesCompressed);

    watch("app/fonts/**.ttf", series(convertFonts, fontsStyle));
};

exports.convertStyles = convertStyles;
exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.imagesCompressed = imagesCompressed;

exports.struct = createFiles;

exports.default = parallel(convertStyles, convertStyles, watchFiles, browserSync, series(convertFonts, fontsStyle));



function movehtml () {
    return src('app/*.html')
    .pipe(dest('dist'))
};
function moveCss () {
    return src('app/css/*.css')
    .pipe(dest('dist/css'))
};
function moveJS () {
    return src('app/js/*.js')
    .pipe(dest('dist/js'))
};
function moveImgs () {
    return src('app/img/*')
    .pipe(dest('dist/img'))
};

exports.movehtml = movehtml;
exports.moveCss = moveCss;
exports.moveJS = moveJS;
exports.moveImgs = moveImgs;

exports.build = series(movehtml, moveCss, moveJS, moveImgs);




function convertFonts () {
    src(["app/fonts/**.ttf"])
    .pipe(ttf2woff())
    .pipe(dest("app/fonts/"));
    return src(["app/fonts/**.ttf"])
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts/"));
};
exports.fontsStyle = fontsStyle;
exports.convertFonts = convertFonts;
exports.cFonts = series(convertFonts, fontsStyle);
//! Font Face для шрифтов
const cb = () => {};

let srcFonts = "app/scss/_fonts.scss";
let appFonts = "app/fonts";

function fontsStyle() {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, "", cb);
    fs.readdir(appFonts, function (err, items) {
        if (items) {
            let c_fontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split(".");
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fs.appendFile(
                        srcFonts,
                        '@include font-face("' +
                            fontname +
                            '", "' +
                            fontname +
                            '", 400);rn',
                        cb
                    );
                }
                c_fontname = fontname;
            }
        }
    });
}

 