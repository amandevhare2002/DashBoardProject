
// @ts-nocheck
import { Buffer } from "buffer";
import crypto from "crypto";
import pako from 'pako';

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;
export function decryptText(textToDecrypt: any, secretKey = encryptionKey, mode = 'CBC', keySize = 128, dataFormat: any = 'base64') {
    const _0x3903e3 = _0x3c6c; function _0x4e28() { const _0x584ebe = ['final', '258774ooGHLm', '416112QIfRRt', 'from', 'update', 'base64', '231flOmqa', '72tCTGmj', '3YmAuFU', '138230sctqym', 'charCodeAt', 'aes-', 'parse', '1035890laPfGR', '450010RCShzM', 'decode', 'error', '27384LfMDEl', 'Decryption\x20error:', '1196406sQXXpp']; _0x4e28 = function () { return _0x584ebe; }; return _0x4e28(); } function _0x3c6c(_0x398f09, _0x4af7e4) { const _0x4e2851 = _0x4e28(); return _0x3c6c = function (_0x3c6c5d, _0xd29e32) { _0x3c6c5d = _0x3c6c5d - 0x103; let _0x16d6af = _0x4e2851[_0x3c6c5d]; return _0x16d6af; }, _0x3c6c(_0x398f09, _0x4af7e4); } (function (_0x5a9be7, _0x7caa20) { const _0x31f718 = _0x3c6c, _0x20c04c = _0x5a9be7(); while (!![]) { try { const _0x25d6d0 = parseInt(_0x31f718(0x104)) / 0x1 + -parseInt(_0x31f718(0x110)) / 0x2 + parseInt(_0x31f718(0x103)) / 0x3 * (-parseInt(_0x31f718(0x111)) / 0x4) + parseInt(_0x31f718(0x108)) / 0x5 + -parseInt(_0x31f718(0x10e)) / 0x6 + parseInt(_0x31f718(0x115)) / 0x7 * (-parseInt(_0x31f718(0x10c)) / 0x8) + -parseInt(_0x31f718(0x116)) / 0x9 * (-parseInt(_0x31f718(0x109)) / 0xa); if (_0x25d6d0 === _0x7caa20) break; else _0x20c04c['push'](_0x20c04c['shift']()); } catch (_0x219a40) { _0x20c04c['push'](_0x20c04c['shift']()); } } }(_0x4e28, 0x26f99)); try { const decipher = crypto['createDecipheriv'](_0x3903e3(0x106) + keySize + '-' + mode, encryptionKey, Buffer['alloc'](0x10, 0x0)); let decrypted = decipher[_0x3903e3(0x113)](textToDecrypt, dataFormat, _0x3903e3(0x114)); decrypted += decipher[_0x3903e3(0x10f)](_0x3903e3(0x114)); const gezipedData = atob(decrypted), gzipedDataArray = Uint8Array[_0x3903e3(0x112)](gezipedData, _0x6ad153 => _0x6ad153[_0x3903e3(0x105)](0x0)), ungzipedData = pako['ungzip'](gzipedDataArray); return JSON[_0x3903e3(0x107)](new TextDecoder()[_0x3903e3(0x10a)](ungzipedData)); } catch (_0x31b322) { return console[_0x3903e3(0x10b)](_0x3903e3(0x10d), _0x31b322), null; }
}

export const reIndexTabs = (tabs: any) => {
    return tabs.map((tab: any, index: number) => ({ ...tab, id: index }))
}

export const isNamePresentInArray = (nameToFind: string, array: any) => {
    const matchingItem = array.find((item: any) => item.name.toLowerCase() === nameToFind.toLowerCase());
    return matchingItem ? matchingItem.id : null;
};


interface DropdownOption {
    value: string;
    label: string;
    fieldnamechange?: any[];
    visibilityfields?: any[];
}

export const promiseOptions = async (
    inputValue: string,
    columnSelect: string,
    updatedPersonalDetails: any[],
    value: number
): Promise<DropdownOption[]> => {
    try {
        const columnsData = updatedPersonalDetails[value]?.Values?.find(
            (reportCol: any) => Number(reportCol.FieldID) === Number(columnSelect)
        );

        if (!columnsData) return [];

        const dynamicPayload = buildDynamicPayload(columnsData);
        if (!dynamicPayload?.Colname) return [];

        const data = {
            ...dynamicPayload,
            Userid: localStorage.getItem("username") || "",
            SearchText: inputValue,
        };

        const res = await axios.post(columnsData.APIURL, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        return res?.data?.colvalues?.map((value: any) => ({
            value: value.Colvalue,
            label: value.colvaluesAlias,
            fieldnamechange: value.fieldnamechange,
            visibilityfields: value.visibilityfields,
        })) || [];
    } catch (error) {
        console.error("Dropdown options error:", error);
        return [];
    }
};

// Implement this based on your existing logic
const buildDynamicPayload = (field: any): any => {
    // Your existing payload building logic
    return {};
};