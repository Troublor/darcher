import * as path from "path";
import * as shell from "shelljs";
import * as fs from "fs";
import * as os from "os";

const keythereum = require("keythereum");

/**
 * Create accounts and export to directory
 * @param count the number of accounts to create
 * @param dir the dir to export accounts
 * @param passphrase the passphrase for each account (same for all)
 */
function createAccounts(count: number, dir: string, passphrase: string = '') {
    let passwords: string[] = [];
    for (let i = 0; i < count; i++) {
        passwords.push(passphrase);
        let dk = keythereum.create();
        let keyObject = keythereum.dump(passphrase, dk.privateKey, dk.salt, dk.iv);
        let publicKey = keythereum.privateKeyToAddress(dk.privateKey)
        let filePath = keythereum.exportToFile(keyObject, dir);
        let newName = `account${i}-${publicKey}.json`;
        shell.mv(filePath, path.join(dir, newName))
        console.log(`Generated account '${publicKey}' (passphrase: ${passphrase}) at ${path.join(dir, newName)}'`);
    }
    if (passwords.length > 0) {
        let passwordsPath = path.join(dir, "passwords.txt")
        fs.writeFileSync(passwordsPath, passwords.join(os.EOL));
        console.log(`Generated passwords.txt at ${passwordsPath}`);
    }
}

if (require.main == module) {
    createAccounts(5, path.join(__dirname, "..", "keystore"));
}