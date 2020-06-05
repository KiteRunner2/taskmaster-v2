import * as SecureStorage from "secure-web-storage";
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = 'S3cr@7!';

export const secureStorage = new SecureStorage(localStorage, {
    hash: function hash(key) {
        key = CryptoJS.SHA256(key, SECRET_KEY);

        return key.toString();
    },
    encrypt: function encrypt(data) {
        data = CryptoJS.AES.encrypt(data, SECRET_KEY);

        data = data.toString();

        return data;
    },
    decrypt: function decrypt(data) {
        data = CryptoJS.AES.decrypt(data, SECRET_KEY);

        data = data.toString(CryptoJS.enc.Utf8);

        return data;
    }
});

const TOKEN_KEY = 'email';

export const login = () => {
    localStorage.setItem(TOKEN_KEY, 'user@email.com');
}

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
}

export const isLogin = () => {
    if (secureStorage.getItem(TOKEN_KEY)) {
        return true;
    }

    return false;
}

export const addColumn = () => {
    const newColumn = {
        name: '',
        id: uuidv4(),
        cards: [],
    };
    return newColumn;
}

export const addCard = () => {
    const newCard = {
        title: "",
        id: uuidv4(),
        duedate: "",
        lables: ["Important", "Medium", "Low"],
        description: "",
        asignee: [""],
      };
    return newCard;
}