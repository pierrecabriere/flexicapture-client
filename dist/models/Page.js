"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Page {
    constructor(params) {
        this.Id = 0;
        this.SourceFileName = "";
        this.SourcePageNumber = 0;
        this.PageIndex = 0;
        this.SourceType = 0;
        this.SourceDetails = "";
        this.Comment = "";
        this.ErrorText = "";
        this.ExternalId = "";
        this.HasAttachments = false;
        this.UncertainSymbols = 0;
        this.VerificationSymbols = 0;
        this.TotalSymbols = 0;
        this.FileVersion = 0;
        this.Flags = 0;
        Object.assign(this, params);
    }
}
exports.default = Page;
