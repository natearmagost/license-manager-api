import CryptoJS from 'crypto-js';
import moment from 'moment';
import config from '../license.config';

const SALT = config.salt;

interface IUserData {
  name: string;
  email?: string;
}

interface IValidUserData {
  name: string;
  email?: string;
  activeDate: string;
  expirationDate?: string;
}

class LicenseManager {
  private salt: string | undefined;

  constructor(salt: string) {
    this.salt = salt;
  }

  public generate(userData: IUserData, meta: string[] = [], expirationDays?: number) {
    const validUserData: IValidUserData = {
      ...userData,
      activeDate: moment().format(),
      expirationDate:
        expirationDays !== undefined
          ? moment()
              .add(expirationDays, 'days')
              .format()
          : undefined
    };

    const key = this.encode(validUserData);
    const formattedKey = this.formatKey(key);
    const printedLicense = this.printLicense(formattedKey, validUserData, meta);
    return printedLicense;
  }

  public validate(printedLicense: string) {
    try {
      const key = this.extractKey(printedLicense);
      const decryptedData = this.decode(key);
      const decryptedDataJSON = JSON.parse(decryptedData);
      if (decryptedDataJSON.expirationDate !== undefined && moment(decryptedDataJSON.expirationDate).isBefore(moment())) {
        return { ...decryptedDataJSON, valid: false, reason: 'License expired' };
      }
      return {
        ...decryptedDataJSON,
        valid: true
      };
    } catch (e) {
      return { valid: false, reason: 'Invalid license' };
    }
  }

  private extractKey(printedLicense: string) {
    let lic = printedLicense
      .trim()
      .replace(/\n/g, '')
      .replace(/ /g, '');
    lic = lic.substring(lic.lastIndexOf('-------------------------') + 25, lic.lastIndexOf('------ENDLICENSE------'));
    return lic;
  }

  private encode(validUserData: IValidUserData) {
    const data = JSON.stringify(validUserData);
    const b64 = CryptoJS.AES.encrypt(data, this.salt).toString();
    const e64 = CryptoJS.enc.Base64.parse(b64);
    const eHex = e64.toString(CryptoJS.enc.Hex);
    const lic = eHex.toUpperCase();
    return lic;
  }

  private printLicense(formattedKey: string, validUserData: IValidUserData, meta: string[]) {
    return (
      `----- BEGIN LICENSE -----\n${validUserData.name}\n${validUserData.email !== undefined ? `${validUserData.email}\n` : ''}Active Date: ${moment(validUserData.activeDate).format(
        'M/D/YYYY'
      )}\n${validUserData.expirationDate !== undefined ? `Expiration Date: ${moment(validUserData.expirationDate).format('M/D/YYYY')}\n` : ''}` +
      meta.join('\n') +
      `${meta.length >= 1 ? `\n` : ''}-------------------------\n${formattedKey.replace(/(.{45})/g, '$1\n')}------ END LICENSE ------`
    );
  }

  private formatKey(k: string) {
    const formattedK = k.replace(/(.{8})/g, '$1 ');
    return formattedK;
  }

  private decode(cipherText) {
    const lic = cipherText.toLowerCase();
    const reb64 = CryptoJS.enc.Hex.parse(lic);
    const bytes = reb64.toString(CryptoJS.enc.Base64);
    const decrypt = CryptoJS.AES.decrypt(bytes, this.salt);
    const plain = decrypt.toString(CryptoJS.enc.Utf8);
    return plain;
  }
}

const licenseManager = new LicenseManager(SALT);

export default licenseManager;
