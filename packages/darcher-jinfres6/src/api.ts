const {instrument} = require("./instrumentation");
const path = require("path");
const fs = require("fs");

export function instrumentFile(src: string, out: string = src, libPath: string = "jinfres6"): void{
    // check whether src is a file
    let stat = fs.statSync(src);
    if (stat.isFile()) {
        // check out
        if (fs.existsSync(out) && fs.statSync(out).isDirectory()) {
            out = path.join(out, path.basename(src));
        }
        // check ext. name
        if (path.extname(src).toLowerCase() !== ".js") {
            // throw new Error(`${src} is not javascript file`);
            fs.copyFileSync(src, out);
            return
        }else{
            let content = fs.readFileSync(src);
            try {
                content = instrument(content.toString(), libPath, "");
                fs.writeFileSync(out, "/* eslint-disable */\n" + content);
                console.log("Instrument success: " + src);
            }catch (e) {
                console.error("Instrument file failed: " + src);
                console.error(e.toString());
                console.error();
            }
        }
    }else {
        throw new Error(`${src} is not a file`);
    }
}

export function instrumentDir(src: string, out: string = src, libPath: string = "jinfres6", localLib: boolean = false): void {
    let stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (fs.existsSync(out) && fs.statSync(out).isFile()) {
            throw new Error(`${out} is a file, expecting a directory.`)
        }
        if (!fs.existsSync(out)) {
            fs.mkdirSync(out, {recursive: true});
        }
        for (let filename of fs.readdirSync(src)) {
            let stat = fs.statSync(path.join(src, filename));
            if (stat.isFile()) {
                instrumentFile(path.join(src, filename), out, libPath);
            }else if (stat.isDirectory()) {
                if (localLib) {
                    instrumentDir(path.join(src, filename), path.join(out, filename), path.join("..", libPath), localLib);
                }else {
                    instrumentDir(path.join(src, filename), path.join(out, filename), libPath, localLib);
                }
            }
        }
    }else {
        throw new Error(`${src} is not a directory`);
    }
}