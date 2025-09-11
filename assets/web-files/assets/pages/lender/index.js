$(document).ready(function () {
    const key = $('input[name="key"]').val();

    var name = ['test_receivables_account_bsb', 'test_receivables_account_number', 'live_receivables_account_bsb', 'live_receivables_account_number'];
    name.forEach(item => {
        let value = $(`#${item}`).text();
        $(`#${item}`).text(decryptString(value.trim()));
    });

    function decryptString(data) {
        var _0x2733 = ['218069rEEaXF', '145437PwpaSV', '13235CfaUGY', 'Utf8', '2683elNAKK', '16JhhSXj', 'toString', 'enc', '73285IOUrdx', 'AES', '3vKxwxf', '3BZLhNq', 'decrypt', '431049mDnivr', '710615bMKAnm', '190zbEMna'];
        var _0x1e98 = function (_0xb39cf0, _0x30028f) {
            _0xb39cf0 = _0xb39cf0 - 0xf6;
            var _0x273323 = _0x2733[_0xb39cf0];
            return _0x273323;
        };
        var _0x161995 = _0x1e98;
        (function (_0xdf3e1, _0x525672) {
            var _0x5d4e14 = _0x1e98;
            while (!![]) {
                try {
                    var _0x201ecb = -parseInt(_0x5d4e14(0xfa)) * -parseInt(_0x5d4e14(0xf7)) + parseInt(_0x5d4e14(0x104)) * parseInt(_0x5d4e14(0x101)) + parseInt(_0x5d4e14(0xfc)) + parseInt(_0x5d4e14(0xf9)) * -parseInt(_0x5d4e14(0x100)) + parseInt(_0x5d4e14(0xfe)) * -parseInt(_0x5d4e14(0x103)) + parseInt(_0x5d4e14(0xfd)) + -parseInt(_0x5d4e14(0xff));
                    if (_0x201ecb === _0x525672) break;
                    else _0xdf3e1['push'](_0xdf3e1['shift']());
                } catch (_0x5bb7ee) {
                    _0xdf3e1['push'](_0xdf3e1['shift']());
                }
            }
        }(_0x2733, 0x63e29));
        var bytes = CryptoJS[_0x161995(0xf8)][_0x161995(0xfb)](data, key),
            originalText = bytes[_0x161995(0x105)](CryptoJS[_0x161995(0xf6)][_0x161995(0x102)]);
            if (originalText.trim() == "") {
                originalText = "N/A";
            }
        return originalText;
    }
});