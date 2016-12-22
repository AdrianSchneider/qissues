"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NoConfigError = (function (_super) {
    __extends(NoConfigError, _super);
    function NoConfigError(message) {
        var _this = _super.call(this) || this;
        _this.name = 'NoConfigError';
        _this.message = message;
        return _this;
    }
    return NoConfigError;
}(Error));
exports.__esModule = true;
exports["default"] = NoConfigError;
