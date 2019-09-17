import moment from 'moment';
import LicenseManager from './licenses';

const removeWhiteSpace = (x: string) => {
  return x.replace(/ +?/g, '');
};

describe('LicenseManager', () => {
  it('runs', () => {
    expect(0).toEqual(0);
  });

  it('creates a simple license', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      []
    );

    const cleanX = removeWhiteSpace(x);

    const licenseUserData = removeWhiteSpace(`----- BEGIN LICENSE -----
    Nate
    test@example.com
    Active Date: ${moment().format('M/D/YYYY')}
    -------------------------`);

    expect(cleanX.indexOf(licenseUserData)).toEqual(0);
  });

  it('creates a license with custom meta data', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      ['Product Name', 'Version 1.0.0']
    );

    const cleanX = removeWhiteSpace(x);

    const licenseUserData = removeWhiteSpace(`----- BEGIN LICENSE -----
    Nate
    test@example.com
    Active Date: ${moment().format('M/D/YYYY')}
    Product Name
    Version 1.0.0
    -------------------------`);

    expect(cleanX.indexOf(licenseUserData)).toEqual(0);
  });

  it('creates a license with undefined meta', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      undefined,
      30
    );

    const cleanX = removeWhiteSpace(x);

    const licenseUserData = removeWhiteSpace(`----- BEGIN LICENSE -----
    Nate
    test@example.com
    Active Date: ${moment().format('M/D/YYYY')}
    Expiration Date: ${moment()
      .add(30, 'days')
      .format('M/D/YYYY')}
    -------------------------`);

    expect(cleanX.indexOf(licenseUserData)).toEqual(0);
  });

  it('creates a license without an email', () => {
    const x = LicenseManager.generate({
      name: 'Nate'
    });

    const cleanX = removeWhiteSpace(x);

    const licenseUserData = removeWhiteSpace(`----- BEGIN LICENSE -----
    Nate
    Active Date: ${moment().format('M/D/YYYY')}
    -------------------------`);

    expect(cleanX.indexOf(licenseUserData)).toEqual(0);
  });

  it('creates a license with an expiration date and custom meta data', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      ['Product Name', 'Version 1.0.0'],
      15
    );

    const cleanX = removeWhiteSpace(x);

    const licenseUserData = removeWhiteSpace(`----- BEGIN LICENSE -----
    Nate
    test@example.com
    Active Date: ${moment().format('M/D/YYYY')}
    Expiration Date: ${moment()
      .add(15, 'days')
      .format('M/D/YYYY')}
    Product Name
    Version 1.0.0
    -------------------------`);

    expect(cleanX.indexOf(licenseUserData)).toEqual(0);
  });

  it('validates a license', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      ['My Product'],
      30
    );
    expect(LicenseManager.validate(x)).toEqual({
      activeDate: moment().format(),
      email: 'test@example.com',
      expirationDate: moment()
        .add(30, 'days')
        .format(),
      name: 'Nate',
      valid: true
    });
  });

  it('returns a false valid attribute for an expire license', () => {
    const x = LicenseManager.generate(
      {
        email: 'test@example.com',
        name: 'Nate'
      },
      ['My Product'],
      -30
    );
    expect(LicenseManager.validate(x)).toEqual({
      activeDate: moment().format(),
      email: 'test@example.com',
      expirationDate: moment()
        .add(-30, 'days')
        .format(),
      name: 'Nate',
      reason: 'License expired',
      valid: false
    });
  });

  it('returns a false for an invalid license', () => {
    const x = `
    ----- BEGIN LICENSE -----
    Nate
    test@example.com
    Active Date: 9/11/2019
    My Product
    -------------------------
    AAAAAAAA 65645F5F 70FAC268 41F27971 
    2D70D8DD 88A7B77A 3198AA8B C8F10AC8 
    FB9610A6 EF16F966 3A8BFA28 E05C3763 
    18E32604 D08D3BFA BBF8EA09 2ADC1C1A 
    A928B37F XXXXXXXX 3E263F0A 509FFB44 
    3343FDB8 A85CF710 717EAE4F EDB6472B 
    D91FF911 87C8AE73 4EC17CAF BED0F324 
    38FBDCE2 CB79A17B XXXXXXXX 30640501 
    1F5E1CF7 20E3E7EA 9D33B03A 8636104C 
    8E981BA1 A66397E6 B0F9A8C1 D413F977 
    ------ END LICENSE ------
    `;
    expect(LicenseManager.validate(x)).toEqual({
      reason: 'Invalid license',
      valid: false
    });
  });
});
